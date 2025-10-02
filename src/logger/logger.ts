import * as Sentry from '@sentry/react-native';
import { InteractionManager, LogBox } from 'react-native';
import {
  fileAsyncTransport,
  mapConsoleTransport,
  logger as RNLogger,
  sentryTransport,
  transportFunctionType,
} from 'react-native-logs';

import RNFS from 'react-native-fs';
import { getSentryDns, isSentryActivated } from '../config/env.config';
import { FileInfo } from '../services/files/native-file-system.types';
import { commonLogsStoreTransport } from '../store/common-logs.store';
import { getAppIdentifier } from '../utils/device.utils';
import { isDevelopment } from '../utils/env.utils';
import { isString } from '../utils/types.utils';
import { LOG_LEVELS, SimpleLogger } from './logger.utils';

LogBox.ignoreLogs([/^ErrorBoundary /, /Support for defaultProps will be removed from function components/]);

const appName = getAppIdentifier();
const logFilenamePrefix = `app-logs-${appName}`;
const logFilenamePattern = `${logFilenamePrefix}-{date-today}.txt`;
const filePath = RNFS.DocumentDirectoryPath ?? '';

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
    FS: RNFS,
    fileNameDateType: 'iso',
    fileName: logFilenamePattern,
    filePath,
  },
});

const isLogFile = (fileName: string): boolean => {
  return fileName.startsWith(logFilenamePrefix);
};

export const loadAllLogFilesInfo = async (): Promise<FileInfo[]> => {
  try {
    const directoryExists = await RNFS.exists(filePath);
    if (!directoryExists) {
      return [];
    }

    const files = await RNFS.readDir(filePath);
    const logFiles = files.filter((file) => file.isFile() && isLogFile(file.name));

    const fileInfos: FileInfo[] = logFiles.map((file) => {
      const mTime = file.mtime;
      const isTimestampString = isString(mTime);
      const modificationTime = isTimestampString ? new Date(mTime).getTime() : mTime?.getTime();

      return {
        exists: true,
        isDirectory: false,
        size: file.size,
        modificationTime,
        uri: file.path,
      };
    });

    return fileInfos
      .filter((info) => !!info?.exists) // only files that exist
      .sort((a, b) => (b.modificationTime ?? 0) - (a.modificationTime ?? 0)); // most recent logs on top
  } catch (e) {
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
    const directoryExists = await RNFS.exists(filePath);
    if (!directoryExists) {
      return;
    }

    const files = await RNFS.readDir(filePath);
    const logFiles = files.filter((file) => file.isFile() && isLogFile(file.name));

    const deletePromises = logFiles.map((file) => RNFS.unlink(file.path));

    await Promise.all(deletePromises);
  } catch (error) {
    logger.error('Error deleting files:', error);
    throw error;
  }
};
