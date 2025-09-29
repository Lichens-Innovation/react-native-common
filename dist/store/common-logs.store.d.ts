import { transportFunctionType } from 'react-native-logs';
import { LogEntry } from '../logger/logger.utils';
declare class CommonLogsStore {
    logEntries: LogEntry[];
    constructor();
    get allLogsAsText(): string;
    addLog(logEntry: LogEntry): void;
    clearLogs(): void;
    filterLogs(filterText: string): LogEntry[];
}
export declare const commonLogsStore: CommonLogsStore;
export declare const commonLogsStoreTransport: transportFunctionType<{}>;
export {};
