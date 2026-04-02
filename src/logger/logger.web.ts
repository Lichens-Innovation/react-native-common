/* eslint-disable @typescript-eslint/no-explicit-any */
import { format } from 'date-fns';
import { commonLogsStore } from '../store/common-logs.store';
import { notImplementedYet } from '../utils/platform.utils';
import { SimpleLogger } from './logger.types';
import { toLogLevel } from './logger.utils';

class LoggerWrapper implements SimpleLogger {
  get todayFilename(): string {
    return `web-${format(new Date(), 'yyyy-MM-dd')}.log`;
  }

  private appendMessage(type: string, message: string, ...args: any[]): void {
    const typeLabel = type.toUpperCase().padEnd(5, ' ');
    const formattedMessage = message.replace(/\n/g, '\n    ');
    const formattedUpdatedAt = new Date().toISOString();
    const stringifiedArgs = args?.length ? JSON.stringify(args) : '';
    const info = `${formattedUpdatedAt} ${typeLabel} : ${formattedMessage} ${stringifiedArgs}`;

    // eslint-disable-next-line no-console -- web stub: no persistent log file
    console.log(info);
    commonLogsStore.addLog({ msg: info, rawMsg: message, level: toLogLevel(type) });
  }

  debug(message: string, ...args: any[]): void {
    this.appendMessage('DEBUG', message, ...args);
  }

  log(message: string, ...args: any[]): void {
    this.appendMessage('LOG', message, ...args);
  }

  info(message: string, ...args: any[]): void {
    this.appendMessage('INFO', message, ...args);
  }

  warn(message: string, ...args: any[]): void {
    this.appendMessage('WARN', message, ...args);
  }

  error(message: string, ...args: any[]): void {
    this.appendMessage('ERROR', message, ...args);
  }
}

export const logger = new LoggerWrapper();

export const loadAllLogFilesInfo = async (): Promise<any[]> => {
  notImplementedYet(
    '[Logger] loadAllLogFilesInfo — listing persisted rotating log files for the live viewer is not implemented on web'
  );
  return [];
};

export const loadCurrentLogsFileUri = async (): Promise<string> => {
  notImplementedYet(
    '[Logger] loadCurrentLogsFileUri — resolving the latest log file URI for export/sharing is not implemented on web'
  );
  return '';
};

export const deleteAllLogFiles = async (): Promise<void> => {
  notImplementedYet('[Logger] deleteAllLogFiles — deleting saved log files from disk is not implemented on web');
};
