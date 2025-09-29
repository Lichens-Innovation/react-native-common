import { SimpleLogger } from './logger.utils';
declare class LoggerWrapper implements SimpleLogger {
    private _file;
    get todayFilename(): string;
    private createTodayFile;
    private getOrCreateTodayFile;
    private appendMessage;
    debug(message: string, ...args: any[]): void;
    log(message: string, ...args: any[]): void;
    info(message: string, ...args: any[]): void;
    warn(message: string, ...args: any[]): void;
    error(message: string, ...args: any[]): void;
}
export declare const logger: LoggerWrapper;
export declare const loadAllLogFilesInfo: () => Promise<any[]>;
export declare const loadCurrentLogsFileUri: () => Promise<string>;
export declare const deleteAllLogFiles: () => Promise<void>;
export {};
