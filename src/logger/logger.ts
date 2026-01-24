import * as Sentry from '@sentry/react-native';
import { InteractionManager, LogBox } from 'react-native';
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
import { getAppIdentifier } from '../utils/device.utils';
import { isDevelopment } from '../utils/env.utils';
import { LOG_LEVELS, SimpleLogger } from './logger.types';

LogBox.ignoreLogs([/^ErrorBoundary /, /Support for defaultProps will be removed from function components/]);

const appName = getAppIdentifier();
const logFilenamePrefix = `app-logs-${appName}`;
const logFilenamePattern = `${logFilenamePrefix}-{date-today}.txt`;
const filePath: string = Paths.document.uri;
if (!filePath) {
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
      // We can add more context data to events (IP address, cookies, user, etc.)
      // @see https://docs.sentry.io/platforms/react-native/data-management/data-collected/
      sendDefaultPii: true,
    });
    transports.push(sentryTransport);
  }

  if (isDevelopment()) {
    transports.push(mapConsoleTransport);
  }

  return transports;
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
  asyncFunc: InteractionManager.runAfterInteractions,
  dateFormat: (date: Date) => `${date.toISOString()} `,
  printLevel: true,
  fixedExtLvlLength: true,
  printDate: true,
  enabled: true,
  transportOptions: {
    // @see https://github.com/mowispace/react-native-logs?tab=readme-ov-file#sentrytransport
    SENTRY: Sentry,
    errorLevels: 'error',
    // @see https://github.com/mowispace/react-native-logs?tab=readme-ov-file#mapconsoletransport
    mapLevels: {
      debug: 'debug',
      log: 'log',
      info: 'info',
      warn: 'warn',
      error: 'error',
    },
    // @see https://github.com/mowispace/react-native-logs?tab=readme-ov-file#fileasynctransport
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

export const deleteAllLogFiles = async (): Promise<void> => {
  try {
    const pathInfo = Paths.info(filePath);
    if (!pathInfo.exists) {
      return;
    }

    const directory = new Directory(filePath);
    const items = directory.list();
    const logFiles: File[] = items.filter(isLogFileItem);

    const errors: Error[] = [];
    for (const file of logFiles) {
      try {
        file.delete();
      } catch (e: unknown) {
        errors.push(e instanceof Error ? e : new Error(String(e)));
      }
    }

    if (errors.length > 0) {
      throw new Error(`Failed to delete ${errors.length} log file(s): ${errors.map((e) => e.message).join('; ')}`);
    }
  } catch (e: unknown) {
    logger.error('Error deleting files:', e);
    throw e;
  }
};
