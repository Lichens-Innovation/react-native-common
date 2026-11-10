/* eslint-disable @typescript-eslint/no-explicit-any */
import { isBlank } from '@lichens-innovation/ts-common';
import * as Sentry from '@sentry/react-native';
import { LogBox } from 'react-native';
import {
  fileAsyncTransport,
  mapConsoleTransport,
  logger as RNLogger,
  sentryTransport,
  transportFunctionType,
} from 'react-native-logs';

import { Directory, File, Paths } from 'expo-file-system';
import * as FileSystemLegacy from 'expo-file-system/legacy';
import { getSentryDns, isSentryActivated } from '../config/env.config';
import { FileInfo } from '../services/files/native-file-system.types';
import { commonLogsStoreTransport } from '../store/common-logs.store';
import { getAppIdentifier } from '../utils/device/device.utils';
import { isDevelopment } from '../utils/device/env.utils';
import { LOG_LEVELS, SimpleLogger } from './logger.types';

LogBox.ignoreLogs([/^ErrorBoundary /, /Support for defaultProps will be removed from function components/]);

const appName = getAppIdentifier();
const logFilenamePrefix = `app-logs-${appName}`;
const logFilenamePattern = `${logFilenamePrefix}-{date-today}.txt`;
const filePath: string = Paths.document.uri;
if (isBlank(filePath)) {
  throw new Error('Failed to initialize logger: document directory path is unavailable');
}

class LoggerWrapper implements SimpleLogger {
  private _logger: ReturnType<typeof RNLogger.createLogger>;

  constructor(config: Parameters<typeof RNLogger.createLogger>[0]) {
    this._logger = RNLogger.createLogger(config);
  }

  debug(message: string, ...args: any[]): void {
    this._logger.debug(message, ...args);
  }

  log(message: string, ...args: any[]): void {
    this._logger.log(message, ...args);
  }

  info(message: string, ...args: any[]): void {
    this._logger.info(message, ...args);
  }

  warn(message: string, ...args: any[]): void {
    this._logger.warn(message, ...args);
  }

  error(message: string, ...args: any[]): void {
    this._logger.error(message, ...args);
  }
}

const getTransports = (): transportFunctionType<any>[] => {
  const transports: transportFunctionType<any>[] = [fileAsyncTransport, commonLogsStoreTransport];

  if (!isDevelopment() && isSentryActivated()) {
    Sentry.init({
      dsn: getSentryDns(),
      // Adds IP address, cookies and user to events: https://docs.sentry.io/platforms/react-native/data-management/data-collected/ habit-hooks-disable non-essential-comment
      sendDefaultPii: true,
    });
    transports.push(sentryTransport);
  }

  if (isDevelopment()) {
    transports.push(mapConsoleTransport);
  }

  return transports;
};

const RN_LOGS_LINE_REGEXP = /^(\S+)\s+(\S+)\s*[:|]\s*([\s\S]*)$/;
const UUID_REGEXP = /[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}/gi;

interface RnLogsLineParts {
  timestamp: string;
  level: string;
  message: string;
}

const parseRnLogsLine = (line: string): RnLogsLineParts => {
  const match = RN_LOGS_LINE_REGEXP.exec(line);
  const trimmedMessage = match?.[3]?.trim();
  return {
    timestamp: match?.[1] ?? '',
    level: match?.[2] ?? '',
    message: isBlank(trimmedMessage) ? line : trimmedMessage,
  };
};

const captureLoggerMessageInSentry = (msg: unknown) => {
  if (typeof msg !== 'string') {
    Sentry.captureException(msg);
    return;
  }

  // Avoid withScope: known Sentry RN bug causes title to become "withScope$argument_0". habit-hooks-disable non-essential-comment
  const { timestamp, level, message } = parseRnLogsLine(msg);
  const fingerprint = message.replace(UUID_REGEXP, '<uuid>');
  const err = new Error(message);
  err.name = `Logger ${isBlank(level) ? 'ERROR' : level}`;
  Sentry.captureException(err, {
    fingerprint: [fingerprint],
    tags: {
      ...(timestamp && { loggerTimestamp: timestamp }),
      ...(level && { loggerLevel: level }),
    },
  });
};

export const logger = new LoggerWrapper({
  severity: 'debug',
  transport: getTransports(),
  levels: {
    debug: LOG_LEVELS.debug,
    log: LOG_LEVELS.log,
    info: LOG_LEVELS.info,
    warn: LOG_LEVELS.warn,
    error: LOG_LEVELS.error,
  },
  async: true,
  asyncFunc: (callback: () => void) => requestIdleCallback(callback),
  dateFormat: (date: Date) => `${date.toISOString()} `,
  printLevel: true,
  fixedExtLvlLength: true,
  printDate: true,
  enabled: true,
  transportOptions: {
    /* habit-hooks-disable non-essential-comment
     * String messages become Error objects so Sentry doesn't group all logger.error() calls into one
     * "sentryTransport" issue. @see https://github.com/mowispace/react-native-logs?tab=readme-ov-file#sentrytransport */
    SENTRY: {
      ...Sentry,
      captureException: captureLoggerMessageInSentry,
    },
    errorLevels: 'error',
    // @see https://github.com/mowispace/react-native-logs?tab=readme-ov-file#mapconsoletransport habit-hooks-disable non-essential-comment
    mapLevels: {
      debug: 'debug',
      log: 'log',
      info: 'info',
      warn: 'warn',
      error: 'error',
    },
    // @see https://github.com/mowispace/react-native-logs?tab=readme-ov-file#fileasynctransport habit-hooks-disable non-essential-comment
    FS: FileSystemLegacy,
    fileNameDateType: 'iso',
    fileName: logFilenamePattern,
    filePath,
  },
});

const isLogFile = (fileName: string): boolean => {
  return fileName.startsWith(logFilenamePrefix);
};

const isLogFileItem = (item: Directory | File): item is File => {
  return item instanceof File && isLogFile(item.name);
};

const byMostRecentFirstComparator = (a: FileInfo, b: FileInfo): number => {
  return (b.modificationTime ?? 0) - (a.modificationTime ?? 0);
};

export const loadAllLogFilesInfo = async (): Promise<FileInfo[]> => {
  try {
    const pathInfo = Paths.info(filePath);
    if (!pathInfo.exists) {
      return [];
    }

    const directory = new Directory(filePath);
    const items = directory.list();
    const logFiles = items.filter(isLogFileItem);

    const fileInfos: FileInfo[] = logFiles
      .map((file) => {
        const info = file.info();
        return {
          exists: info.exists,
          isDirectory: false,
          size: info.size ?? 0,
          modificationTime: info.modificationTime ?? 0,
          uri: file.uri,
        };
      })
      .filter((info) => info.exists);

    return fileInfos.sort(byMostRecentFirstComparator);
  } catch (e: unknown) {
    logger.error('Error loading files:', e);
    return [];
  }
};

export const loadCurrentLogsFileUri = async (): Promise<string> => {
  const fileInfos = await loadAllLogFilesInfo();
  return fileInfos[0]?.uri ?? '';
};

const MS_PER_DAY = 24 * 60 * 60 * 1000;
const SECONDS_TIMESTAMP_UPPER_BOUND = 1e12;

/* habit-hooks-disable non-essential-comment
 * expo-file-system has shipped modificationTime as both seconds and ms across versions.
 * Anything below 1e12 is clearly a seconds-based Unix timestamp (~year 33658 in ms). */
const toModificationTimeMs = (rawModificationTime: number): number =>
  rawModificationTime > SECONDS_TIMESTAMP_UPPER_BOUND ? rawModificationTime : rawModificationTime * 1000;

const deleteLogFileIfOlderThan = (file: File, cutoff: number): boolean => {
  try {
    const info = file.info();
    const mtimeMs = toModificationTimeMs(info.modificationTime ?? 0);
    if (!info.exists || mtimeMs === 0 || mtimeMs >= cutoff) return false;
    file.delete();
    return true;
  } catch (e: unknown) {
    logger.warn(`Failed to delete old log file ${file.name}:`, e);
    return false;
  }
};

/** habit-hooks-disable non-essential-comment
 * Delete log files older than `retentionDays` days. Default 14.
 * Call once at app startup to bound disk usage. Failures on individual files are logged
 * but don't abort the sweep, so partial cleanup is still useful.
 */
export const deleteOldLogFiles = async (retentionDays = 14): Promise<void> => {
  try {
    const pathInfo = Paths.info(filePath);
    if (!pathInfo.exists) return;

    const cutoff = Date.now() - retentionDays * MS_PER_DAY;

    const directory = new Directory(filePath);
    const items = directory.list();
    const logFiles: File[] = items.filter(isLogFileItem);
    const deleted = logFiles.filter((file) => deleteLogFileIfOlderThan(file, cutoff)).length;

    if (deleted > 0) {
      logger.info(`[logger] purged ${deleted} log file(s) older than ${retentionDays} days`);
    }
  } catch (e: unknown) {
    logger.error('Error purging old log files:', e);
  }
};

const tryDeleteFile = (file: File): Error | null => {
  try {
    file.delete();
    return null;
  } catch (e: unknown) {
    return e instanceof Error ? e : new Error(String(e));
  }
};

export const deleteAllLogFiles = async (): Promise<void> => {
  try {
    const pathInfo = Paths.info(filePath);
    if (!pathInfo.exists) {
      return;
    }

    const directory = new Directory(filePath);
    const items = directory.list();
    const logFiles: File[] = items.filter(isLogFileItem);

    const errors = logFiles.map(tryDeleteFile).filter((error): error is Error => error !== null);

    if (errors.length > 0) {
      throw new Error(`Failed to delete ${errors.length} log file(s): ${errors.map((e) => e.message).join('; ')}`);
    }
  } catch (e: unknown) {
    logger.error('Error deleting files:', e);
    throw e;
  }
};
