import { format } from 'date-fns';
import { commonLogsStore } from '../store/common-logs.store';
import { notImplementedYet } from '../utils/platform.utils';
import { SimpleLogger } from './logger.types';
import { toLogLevel } from './logger.utils';

const WindowsStorage = Windows.Storage;
const localFolder = WindowsStorage.ApplicationData.current.localFolder;

class LoggerWrapper implements SimpleLogger {
  private _file: Windows.Storage.IStorageFile | null = null;

  get todayFilename(): string {
    return `desktop-${format(new Date(), 'yyyy-MM-dd')}.log`;
  }

  private async createTodayFile(): Promise<Windows.Storage.IStorageFile> {
    return localFolder.createFileAsync(this.todayFilename, WindowsStorage.CreationCollisionOption.openIfExists);
  }

  private async getOrCreateTodayFile(): Promise<Windows.Storage.IStorageFile> {
    if (this._file?.name === this.todayFilename) {
      return this._file;
    }

    this._file = await this.createTodayFile();
    return this._file;
  }

  private async appendMessage(type: string, message: string, ...args: any[]): Promise<void> {
    const typeLabel = type.toUpperCase().padEnd(5, ' ');
    const formattedMessage = message.replace(/\n/g, '\n    ');
    const formattedUpdatedAt = new Date().toISOString();
    const stringifiedArgs = args?.length ? JSON.stringify(args) : '';
    const info = `${formattedUpdatedAt} ${typeLabel} : ${formattedMessage} ${stringifiedArgs}`;

    // append to file
    const file = await this.getOrCreateTodayFile();
    WindowsStorage.FileIO.appendTextAsync(file, `${info}\n`);

    // add to in-memory store
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
  notImplementedYet('loadAllLogFilesInfo');
  return [];
};

export const loadCurrentLogsFileUri = async (): Promise<string> => {
  notImplementedYet('loadCurrentLogsFileUri');
  return '';
};

export const deleteAllLogFiles = async (): Promise<void> => {
  notImplementedYet('deleteAllLogFiles');
};
