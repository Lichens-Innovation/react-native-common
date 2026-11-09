import Clipboard from '@react-native-clipboard/clipboard';
import * as Sharing from 'expo-sharing';
import * as SQLite from 'expo-sqlite';
import {
  applyFilenameTemplate,
  getSQLiteVersion,
  getUniqueDbFilename,
  mmkvStorageForMobxPersist,
  normalizeFileUri,
  setClipboardTextContent,
  shareFile,
  shareTextFile,
  shareXmlFile,
  storage,
} from '@lib';
import { getMockLogger, getMockMmkv } from './core-test.utils';

const mmkv = getMockMmkv();
const mockLogger = getMockLogger();

describe('file utils', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('normalizeFileUri', () => {
    it.each`
      uri                        | expected
      ${undefined}               | ${''}
      ${null}                    | ${''}
      ${''}                      | ${''}
      ${'   '}                   | ${'file://   '}
      ${'/data/file.txt'}        | ${'file:///data/file.txt'}
      ${'file:///data/file.txt'} | ${'file:///data/file.txt'}
      ${'content://media/1'}     | ${''}
      ${'https://host/file.txt'} | ${''}
    `('normalizes "$uri" to "$expected"', ({ uri, expected }) => {
      expect(normalizeFileUri(uri)).toBe(expected);
    });
  });

  describe('applyFilenameTemplate', () => {
    const timestamp = new Date('2024-03-15T14:30:45.123Z');

    it.each`
      pattern
      ${undefined}
      ${''}
    `('returns the filename untouched when pattern is "$pattern"', ({ pattern }) => {
      expect(applyFilenameTemplate({ filename: 'file.txt', pattern, timestamp })).toBe('file.txt');
    });

    it('applies a whitespace-only pattern instead of returning the filename', () => {
      expect(applyFilenameTemplate({ filename: 'file.txt', pattern: '   ', timestamp })).toBe('   ');
    });

    it('renders context data and date format placeholders', () => {
      // act
      const result = applyFilenameTemplate({
        filename: 'file.txt',
        pattern: 'pre_{{isoDate}}_{{unixTimestamp}}_{{{yyyy}}}',
        timestamp,
      });

      // assert
      expect(result).toBe(`pre_2024-03-15_${timestamp.getTime()}_2024`);
    });
  });

  describe('shareFile', () => {
    beforeEach(() => {
      jest.mocked(Sharing.isAvailableAsync).mockResolvedValue(true);
      jest.mocked(Sharing.shareAsync).mockResolvedValue(undefined);
    });

    it.each`
      fileUri
      ${undefined}
      ${''}
    `('does nothing for fileUri "$fileUri"', async ({ fileUri }) => {
      // act
      await shareFile({ fileUri, mimeType: 'text/plain' });

      // assert
      expect(Sharing.isAvailableAsync).not.toHaveBeenCalled();
      expect(Sharing.shareAsync).not.toHaveBeenCalled();
    });

    it('shares a whitespace-only fileUri as a file:// uri', async () => {
      // act
      await shareFile({ fileUri: '   ' });

      // assert
      expect(Sharing.isAvailableAsync).toHaveBeenCalled();
      expect(Sharing.shareAsync).toHaveBeenCalledWith('file://   ', {});
    });

    it('warns and stops when sharing is unavailable', async () => {
      // arrange
      jest.mocked(Sharing.isAvailableAsync).mockResolvedValue(false);

      // act
      await shareFile({ fileUri: '/a.txt' });

      // assert
      expect(mockLogger.warn).toHaveBeenCalledWith('Sharing is not available on this device');
      expect(Sharing.shareAsync).not.toHaveBeenCalled();
    });

    it('warns and stops for a non-file scheme', async () => {
      // act
      await shareFile({ fileUri: 'https://host/a.txt' });

      // assert
      expect(mockLogger.warn).toHaveBeenCalledWith('[shareFile] Invalid file URI: [https://host/a.txt]');
      expect(Sharing.shareAsync).not.toHaveBeenCalled();
    });

    it.each`
      mimeType             | expectedOptions
      ${undefined}         | ${{}}
      ${''}                | ${{}}
      ${'   '}             | ${{}}
      ${'image/png'}       | ${{}}
      ${'text/plain'}      | ${{ mimeType: 'public.plain-text', UTI: 'public.plain-text' }}
      ${'text/xml'}        | ${{ mimeType: 'application/xml', UTI: 'public.xml' }}
      ${'application/xml'} | ${{ mimeType: 'application/xml', UTI: 'public.xml' }}
    `('uses iOS share options $expectedOptions for mimeType "$mimeType"', async ({ mimeType, expectedOptions }) => {
      // act
      await shareFile({ fileUri: '/a.txt', mimeType });

      // assert
      expect(Sharing.shareAsync).toHaveBeenCalledWith('file:///a.txt', expectedOptions);
    });

    it('logs and resolves when shareAsync rejects', async () => {
      // arrange
      jest.mocked(Sharing.shareAsync).mockRejectedValue(new Error('cancelled'));

      // act
      await expect(shareFile({ fileUri: '/a.txt', mimeType: 'text/plain' })).resolves.toBeUndefined();

      // assert
      expect(mockLogger.error).toHaveBeenCalledWith(
        'Error while sharing file [file:///a.txt] of type text/plain',
        expect.any(Error)
      );
    });

    it('shareTextFile / shareXmlFile delegate with their mime type', async () => {
      // act
      await shareTextFile('/a.txt');
      await shareXmlFile('/b.xml');
      await shareTextFile(undefined);

      // assert
      expect(Sharing.shareAsync).toHaveBeenNthCalledWith(1, 'file:///a.txt', {
        mimeType: 'public.plain-text',
        UTI: 'public.plain-text',
      });
      expect(Sharing.shareAsync).toHaveBeenNthCalledWith(2, 'file:///b.xml', {
        mimeType: 'application/xml',
        UTI: 'public.xml',
      });
      expect(Sharing.shareAsync).toHaveBeenCalledTimes(2);
    });
  });

  describe('sqlite utils', () => {
    it('getSQLiteVersion returns the version and closes the db', async () => {
      // arrange
      const db = { getFirstAsync: jest.fn().mockResolvedValue({ version: '3.45.0' }), closeAsync: jest.fn() };
      jest.mocked(SQLite.openDatabaseAsync).mockResolvedValue(db as never);

      // act
      const version = await getSQLiteVersion();

      // assert
      expect(version).toBe('3.45.0');
      expect(SQLite.openDatabaseAsync).toHaveBeenCalledWith(':memory:');
      expect(db.closeAsync).toHaveBeenCalled();
    });

    it('getSQLiteVersion returns "Unknown" when no row', async () => {
      // arrange
      const db = { getFirstAsync: jest.fn().mockResolvedValue(null), closeAsync: jest.fn() };
      jest.mocked(SQLite.openDatabaseAsync).mockResolvedValue(db as never);

      // act & assert
      await expect(getSQLiteVersion()).resolves.toBe('Unknown');
    });

    it('getSQLiteVersion logs and rethrows a prefixed error without cause', async () => {
      // arrange
      const original = new Error('no sqlite');
      jest.mocked(SQLite.openDatabaseAsync).mockRejectedValue(original);

      // act
      const error = (await getSQLiteVersion().catch((e: unknown) => e)) as Error;

      // assert
      expect(error.message).toBe('[getSQLiteVersion] no sqlite');
      expect(error.cause).toBeUndefined();
      expect(mockLogger.error).toHaveBeenCalledWith('[getSQLiteVersion] no sqlite', original);
    });

    it.each`
      prefix       | expectedStart
      ${undefined} | ${''}
      ${'db_'}     | ${'db_'}
    `('getUniqueDbFilename uses prefix "$prefix"', ({ prefix, expectedStart }) => {
      // act
      const filename = getUniqueDbFilename(prefix);

      // assert
      expect(filename.startsWith(expectedStart)).toBe(true);
      expect(filename).toMatch(/\.db$/);
      expect(filename.length).toBeGreaterThan(`${expectedStart}.db`.length);
    });
  });

  describe('storage', () => {
    it.each`
      value       | stored
      ${true}     | ${true}
      ${0}        | ${0}
      ${''}       | ${''}
      ${'text'}   | ${'text'}
      ${{ a: 1 }} | ${'{"a":1}'}
      ${[1, 2]}   | ${'[1,2]'}
      ${null}     | ${'null'}
    `('setItem stores $value as $stored', ({ value, stored }) => {
      // act
      storage.setItem('key', value);

      // assert
      expect(mmkv.set).toHaveBeenCalledWith('key', stored);
    });

    it('setItem stores an ArrayBuffer as is', () => {
      // arrange
      const buffer = new ArrayBuffer(2);

      // act
      storage.setItem('key', buffer);

      // assert
      expect(mmkv.set).toHaveBeenCalledWith('key', buffer);
    });

    it('setItem stores undefined as the JSON.stringify result (undefined)', () => {
      // act
      storage.setItem('key', undefined);

      // assert
      expect(mmkv.set).toHaveBeenCalledWith('key', undefined);
    });

    it('getItem uses the typed getter for boolean / number defaults and falls back to the default', () => {
      // arrange
      mmkv.getBoolean.mockReturnValueOnce(false).mockReturnValueOnce(undefined);
      mmkv.getNumber.mockReturnValueOnce(0).mockReturnValueOnce(undefined);

      // act & assert
      expect(storage.getItem('b', true)).toBe(false);
      expect(storage.getItem('b', true)).toBe(true);
      expect(storage.getItem('n', 5)).toBe(0);
      expect(storage.getItem('n', 5)).toBe(5);
    });

    it('getItem uses getBuffer for Uint8Array defaults', () => {
      // arrange
      const fallback = new Uint8Array([1]);
      const stored = new Uint8Array([2]);
      mmkv.getBuffer.mockReturnValueOnce(stored).mockReturnValueOnce(undefined);

      // act & assert
      expect(storage.getItem('buf', fallback)).toBe(stored);
      expect(storage.getItem('buf', fallback)).toBe(fallback);
    });

    it.each`
      stringValue   | defaultValue | expected
      ${undefined}  | ${'def'}     | ${'def'}
      ${null}       | ${'def'}     | ${'def'}
      ${''}         | ${'def'}     | ${''}
      ${'   '}      | ${'def'}     | ${'   '}
      ${'{"a":1}'}  | ${'def'}     | ${'{"a":1}'}
      ${'{"a":1}'}  | ${{}}        | ${{ a: 1 }}
      ${'not json'} | ${{}}        | ${'not json'}
      ${undefined}  | ${{ x: 1 }}  | ${{ x: 1 }}
      ${'null'}     | ${{ x: 1 }}  | ${null}
    `(
      'getItem returns $expected for stored $stringValue and default $defaultValue',
      ({ stringValue, defaultValue, expected }) => {
        // arrange
        mmkv.getString.mockReturnValueOnce(stringValue);

        // act
        const result = storage.getItem('key', defaultValue);

        // assert
        expect(result).toEqual(expected);
      }
    );

    it('removeItem deletes the key', () => {
      // act
      storage.removeItem('key');

      // assert
      expect(mmkv.delete).toHaveBeenCalledWith('key');
    });

    it('mmkvStorageForMobxPersist wraps MMKV in promises with null for missing values', async () => {
      // arrange
      mmkv.getString.mockReturnValueOnce('v').mockReturnValueOnce(undefined);

      // act
      await mmkvStorageForMobxPersist.setItem('k', 'v');
      const found = await mmkvStorageForMobxPersist.getItem('k');
      const missing = await mmkvStorageForMobxPersist.getItem('k');
      await mmkvStorageForMobxPersist.removeItem('k');

      // assert
      expect(mmkv.set).toHaveBeenCalledWith('k', 'v');
      expect(found).toBe('v');
      expect(missing).toBeNull();
      expect(mmkv.delete).toHaveBeenCalledWith('k');
    });
  });

  describe('setClipboardTextContent', () => {
    it('copies the value and logs a 20 chars preview', async () => {
      // act
      await setClipboardTextContent('0123456789012345678901234');

      // assert
      expect(Clipboard.setString).toHaveBeenCalledWith('0123456789012345678901234');
      expect(mockLogger.info).toHaveBeenCalledWith(
        '[setClipboardTextContent] setting value',
        '01234567890123456789...'
      );
    });

    it('defaults to an empty string', async () => {
      // act
      await setClipboardTextContent();

      // assert
      expect(Clipboard.setString).toHaveBeenCalledWith('');
    });
  });
});
