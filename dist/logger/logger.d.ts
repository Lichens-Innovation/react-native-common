import { logger as RNLogger } from 'react-native-logs';
import { FileInfo } from '../services/files/native-file-system.types';
import { SimpleLogger } from './logger.utils';
declare class LoggerWrapper implements SimpleLogger {
    private _logger;
    constructor(config: Parameters<typeof RNLogger.createLogger>[0]);
    debug(message: string, ...args: any[]): void;
    log(message: string, ...args: any[]): void;
    info(message: string, ...args: any[]): void;
    warn(message: string, ...args: any[]): void;
    error(message: string, ...args: any[]): void;
}
export declare const logger: LoggerWrapper;
export declare const loadAllLogFilesInfo: () => Promise<FileInfo[]>;
export declare const loadCurrentLogsFileUri: () => Promise<string>;
export declare const deleteAllLogFiles: () => Promise<void>;
export {};
