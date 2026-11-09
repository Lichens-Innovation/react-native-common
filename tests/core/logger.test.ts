import * as Sentry from '@sentry/react-native';
import { Directory, File, Paths } from 'expo-file-system';
import * as RNLogs from 'react-native-logs';
import {
  deleteAllLogFiles,
  deleteOldLogFiles,
  loadAllLogFilesInfo,
  loadCurrentLogsFileUri,
  sanitizeUrl,
  toLogLevel,
} from '@lib';
import { getMockLogger } from './core-test.utils';

jest.mock('expo-file-system', () => {
  class MockFile {
    name: string;
    uri: string;
    info = jest.fn();
    delete = jest.fn();
    constructor(name: string) {
      this.name = name;
      this.uri = `/mock/document/${name}`;
    }
  }
  class MockDirectory {
    static items: unknown[] = [];
    list() {
      return MockDirectory.items;
    }
  }
  return {
    File: MockFile,
    Directory: MockDirectory,
    Paths: {
      document: { uri: '/mock/document/' },
      cache: { uri: '/mock/cache/' },
      info: jest.fn(() => ({ exists: true })),
    },
  };
});

type SentryCaptureException = (msg: unknown) => void;

// captured before any mock clearing: the config the logger module passed to react-native-logs at import time habit-hooks-disable non-essential-comment
const loggerConfig = jest.mocked(RNLogs.logger.createLogger).mock.calls[0]?.[0] as {
  transportOptions: { SENTRY: { captureException: SentryCaptureException } };
};
const sentryCaptureException = loggerConfig.transportOptions.SENTRY.captureException;
const mockLogger = getMockLogger();

const LOG_PREFIX = 'app-logs-app';
const DAY_MS = 24 * 60 * 60 * 1000;
const NOW = new Date('2026-01-31T12:00:00.000Z').getTime();

interface MockFileInstance {
  name: string;
  uri: string;
  info: jest.Mock;
  delete: jest.Mock;
}

const makeFile = (name: string, info: object = { exists: true, size: 1, modificationTime: NOW }): MockFileInstance => {
  const file = new (File as unknown as new (name: string) => MockFileInstance)(name);
  file.info.mockReturnValue(info);
  return file;
};

const setDirectoryItems = (items: unknown[]) => {
  (Directory as unknown as { items: unknown[] }).items = items;
};

describe('logger', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    jest.mocked(Paths.info as jest.Mock).mockReturnValue({ exists: true });
    setDirectoryItems([]);
  });

  describe('Sentry captureException wrapper', () => {
    it('forwards non-string messages untouched', () => {
      // arrange
      const error = new Error('boom');

      // act
      sentryCaptureException(error);

      // assert
      expect(Sentry.captureException).toHaveBeenCalledTimes(1);
      expect(Sentry.captureException).toHaveBeenCalledWith(error);
    });

    it('turns a react-native-logs line into a named Error with fingerprint and tags', () => {
      // act
      sentryCaptureException('2026-01-01T00:00:00.000Z ERROR : Failed for 123e4567-e89b-12d3-a456-426614174000 now');

      // assert
      const [err, context] = jest.mocked(Sentry.captureException).mock.calls[0] as [Error, object];
      expect(err).toBeInstanceOf(Error);
      expect(err.message).toBe('Failed for 123e4567-e89b-12d3-a456-426614174000 now');
      expect(err.name).toBe('Logger ERROR');
      expect(context).toEqual({
        fingerprint: ['Failed for <uuid> now'],
        tags: { loggerTimestamp: '2026-01-01T00:00:00.000Z', loggerLevel: 'ERROR' },
      });
    });

    it('accepts the pipe separator and trims the message', () => {
      // act
      sentryCaptureException('ts WARN |   spaced message   ');

      // assert
      const [err, context] = jest.mocked(Sentry.captureException).mock.calls[0] as [Error, object];
      expect(err.message).toBe('spaced message');
      expect(err.name).toBe('Logger WARN');
      expect(context).toEqual({
        fingerprint: ['spaced message'],
        tags: { loggerTimestamp: 'ts', loggerLevel: 'WARN' },
      });
    });

    it('falls back to the whole line and ERROR name when the line does not match the format', () => {
      // act
      sentryCaptureException('just-a-message');

      // assert
      const [err, context] = jest.mocked(Sentry.captureException).mock.calls[0] as [Error, object];
      expect(err.message).toBe('just-a-message');
      expect(err.name).toBe('Logger ERROR');
      expect(context).toEqual({ fingerprint: ['just-a-message'], tags: {} });
    });

    it('falls back to the whole line when the message part is whitespace-only', () => {
      // arrange
      const line = 'ts ERROR :    ';

      // act
      sentryCaptureException(line);

      // assert
      const [err, context] = jest.mocked(Sentry.captureException).mock.calls[0] as [Error, object];
      expect(err.message).toBe(line);
      expect(err.name).toBe('Logger ERROR');
      expect(context).toEqual({ fingerprint: [line], tags: { loggerTimestamp: 'ts', loggerLevel: 'ERROR' } });
    });

    it('replaces every uuid (case-insensitive) in the fingerprint only', () => {
      // act
      sentryCaptureException('t E : a 123E4567-E89B-12D3-A456-426614174000 b 123e4567-e89b-12d3-a456-426614174001');

      // assert
      const [err, context] = jest.mocked(Sentry.captureException).mock.calls[0] as [Error, { fingerprint: string[] }];
      expect(err.message).toContain('123E4567');
      expect(context.fingerprint).toEqual(['a <uuid> b <uuid>']);
    });
  });

  describe('sanitizeUrl', () => {
    it.each`
      url                                | expected
      ${undefined}                       | ${undefined}
      ${null}                            | ${null}
      ${''}                              | ${''}
      ${'   '}                           | ${'   '}
      ${'http://user:pass@host:80/path'} | ${'http://host:80/path'}
      ${'http://host/path'}              | ${'http://host/path'}
      ${'https://user:pass@host/path'}   | ${'https://user:pass@host/path'}
    `('returns $expected for $url', ({ url, expected }) => {
      expect(sanitizeUrl(url)).toBe(expected);
    });
  });

  describe('toLogLevel', () => {
    it.each`
      type       | expected
      ${'debug'} | ${{ text: 'DEBUG', severity: 0 }}
      ${'INFO'}  | ${{ text: 'INFO', severity: 2 }}
      ${'Error'} | ${{ text: 'ERROR', severity: 4 }}
      ${'other'} | ${{ text: 'OTHER', severity: undefined }}
    `('maps $type', ({ type, expected }) => {
      expect(toLogLevel(type)).toEqual(expected);
    });
  });

  describe('loadAllLogFilesInfo / loadCurrentLogsFileUri', () => {
    it('returns only existing log files, most recent first', async () => {
      // arrange
      setDirectoryItems([
        makeFile(`${LOG_PREFIX}-old.txt`, { exists: true, size: 10, modificationTime: 100 }),
        makeFile(`${LOG_PREFIX}-new.txt`, { exists: true, modificationTime: 300 }),
        makeFile(`${LOG_PREFIX}-gone.txt`, { exists: false, modificationTime: 999 }),
        makeFile('other.txt', { exists: true, modificationTime: 500 }),
        { name: `${LOG_PREFIX}-not-a-file` },
      ]);

      // act
      const infos = await loadAllLogFilesInfo();
      const currentUri = await loadCurrentLogsFileUri();

      // assert
      expect(infos).toEqual([
        {
          exists: true,
          isDirectory: false,
          size: 0,
          modificationTime: 300,
          uri: `/mock/document/${LOG_PREFIX}-new.txt`,
        },
        {
          exists: true,
          isDirectory: false,
          size: 10,
          modificationTime: 100,
          uri: `/mock/document/${LOG_PREFIX}-old.txt`,
        },
      ]);
      expect(currentUri).toBe(`/mock/document/${LOG_PREFIX}-new.txt`);
    });

    it('returns an empty list when the log folder does not exist', async () => {
      // arrange
      jest.mocked(Paths.info as jest.Mock).mockReturnValue({ exists: false });

      // act
      const infos = await loadAllLogFilesInfo();

      // assert
      expect(infos).toEqual([]);
      expect(await loadCurrentLogsFileUri()).toBe('');
    });

    it('logs and returns an empty list when listing throws', async () => {
      // arrange
      jest.mocked(Paths.info as jest.Mock).mockImplementation(() => {
        throw new Error('io');
      });

      // act
      const infos = await loadAllLogFilesInfo();

      // assert
      expect(infos).toEqual([]);
      expect(mockLogger.error).toHaveBeenCalledWith('Error loading files:', expect.any(Error));
    });
  });

  describe('deleteOldLogFiles', () => {
    beforeEach(() => {
      jest.useFakeTimers({ now: NOW });
    });

    afterEach(() => {
      jest.useRealTimers();
    });

    it('deletes only log files older than the default 14 days (ms and seconds timestamps)', async () => {
      // arrange
      const oldMs = makeFile(`${LOG_PREFIX}-a.txt`, { exists: true, modificationTime: NOW - 15 * DAY_MS });
      const oldSeconds = makeFile(`${LOG_PREFIX}-b.txt`, {
        exists: true,
        modificationTime: (NOW - 20 * DAY_MS) / 1000,
      });
      const recent = makeFile(`${LOG_PREFIX}-c.txt`, { exists: true, modificationTime: NOW - 13 * DAY_MS });
      const zeroTime = makeFile(`${LOG_PREFIX}-d.txt`, { exists: true, modificationTime: 0 });
      const noTime = makeFile(`${LOG_PREFIX}-e.txt`, { exists: true });
      const missing = makeFile(`${LOG_PREFIX}-f.txt`, { exists: false, modificationTime: NOW - 30 * DAY_MS });
      const notALog = makeFile('other.txt', { exists: true, modificationTime: NOW - 30 * DAY_MS });
      setDirectoryItems([oldMs, oldSeconds, recent, zeroTime, noTime, missing, notALog]);

      // act
      await deleteOldLogFiles();

      // assert
      expect(oldMs.delete).toHaveBeenCalledTimes(1);
      expect(oldSeconds.delete).toHaveBeenCalledTimes(1);
      [recent, zeroTime, noTime, missing, notALog].forEach((file) => expect(file.delete).not.toHaveBeenCalled());
      expect(mockLogger.info).toHaveBeenCalledWith('[logger] purged 2 log file(s) older than 14 days');
    });

    it('honours a custom retention and keeps sweeping when one file fails', async () => {
      // arrange
      const failing = makeFile(`${LOG_PREFIX}-a.txt`, { exists: true, modificationTime: NOW - 3 * DAY_MS });
      failing.delete.mockImplementation(() => {
        throw new Error('locked');
      });
      const ok = makeFile(`${LOG_PREFIX}-b.txt`, { exists: true, modificationTime: NOW - 3 * DAY_MS });
      setDirectoryItems([failing, ok]);

      // act
      await deleteOldLogFiles(2);

      // assert
      expect(ok.delete).toHaveBeenCalledTimes(1);
      expect(mockLogger.warn).toHaveBeenCalledWith(
        `Failed to delete old log file ${LOG_PREFIX}-a.txt:`,
        expect.any(Error)
      );
      expect(mockLogger.info).toHaveBeenCalledWith('[logger] purged 1 log file(s) older than 2 days');
    });

    it('logs nothing when no file is deleted', async () => {
      // arrange
      setDirectoryItems([makeFile(`${LOG_PREFIX}-a.txt`, { exists: true, modificationTime: NOW })]);

      // act
      await deleteOldLogFiles();

      // assert
      expect(mockLogger.info).not.toHaveBeenCalled();
    });

    it('does nothing when the log folder does not exist', async () => {
      // arrange
      jest.mocked(Paths.info as jest.Mock).mockReturnValue({ exists: false });
      const file = makeFile(`${LOG_PREFIX}-a.txt`, { exists: true, modificationTime: 1 });
      setDirectoryItems([file]);

      // act
      await deleteOldLogFiles();

      // assert
      expect(file.delete).not.toHaveBeenCalled();
    });

    it('logs an error and resolves when the sweep itself throws', async () => {
      // arrange
      jest.mocked(Paths.info as jest.Mock).mockImplementation(() => {
        throw new Error('io');
      });

      // act
      await expect(deleteOldLogFiles()).resolves.toBeUndefined();

      // assert
      expect(mockLogger.error).toHaveBeenCalledWith('Error purging old log files:', expect.any(Error));
    });
  });

  describe('deleteAllLogFiles', () => {
    it('deletes every log file and ignores other files', async () => {
      // arrange
      const logA = makeFile(`${LOG_PREFIX}-a.txt`);
      const logB = makeFile(`${LOG_PREFIX}-b.txt`);
      const other = makeFile('other.txt');
      setDirectoryItems([logA, logB, other]);

      // act
      await deleteAllLogFiles();

      // assert
      expect(logA.delete).toHaveBeenCalledTimes(1);
      expect(logB.delete).toHaveBeenCalledTimes(1);
      expect(other.delete).not.toHaveBeenCalled();
    });

    it('attempts every file then rejects with an aggregated message (Error and non-Error throws)', async () => {
      // arrange
      const failA = makeFile(`${LOG_PREFIX}-a.txt`);
      failA.delete.mockImplementation(() => {
        throw new Error('locked');
      });
      const ok = makeFile(`${LOG_PREFIX}-b.txt`);
      const failC = makeFile(`${LOG_PREFIX}-c.txt`);
      failC.delete.mockImplementation(() => {
        // eslint-disable-next-line @typescript-eslint/only-throw-error -- simulates a native call throwing a non-Error value
        throw 'raw failure';
      });
      setDirectoryItems([failA, ok, failC]);

      // act
      const promise = deleteAllLogFiles();

      // assert
      await expect(promise).rejects.toThrow('Failed to delete 2 log file(s): locked; raw failure');
      expect(ok.delete).toHaveBeenCalledTimes(1);
      expect(mockLogger.error).toHaveBeenCalledWith('Error deleting files:', expect.any(Error));
    });

    it('resolves without deleting when the log folder does not exist', async () => {
      // arrange
      jest.mocked(Paths.info as jest.Mock).mockReturnValue({ exists: false });
      const file = makeFile(`${LOG_PREFIX}-a.txt`);
      setDirectoryItems([file]);

      // act
      await deleteAllLogFiles();

      // assert
      expect(file.delete).not.toHaveBeenCalled();
    });
  });
});
