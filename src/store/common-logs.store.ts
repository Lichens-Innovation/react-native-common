import { makeAutoObservable } from 'mobx';
import { transportFunctionType } from 'react-native-logs';
import { LogEntry } from '../logger/logger.utils';

const MAX_LOG_ENTRIES = 10 * 1000;

class CommonLogsStore {
  logEntries: LogEntry[] = [];

  constructor() {
    makeAutoObservable(this);
  }

  get allLogsAsText(): string {
    return this.logEntries
      .map((log) => log.msg)
      .filter((log) => !!log)
      .join('\n');
  }

  addLog(logEntry: LogEntry): void {
    this.logEntries.push(logEntry);

    if (this.logEntries.length > MAX_LOG_ENTRIES) {
      this.logEntries.shift(); // remove the oldest log
    }
  }

  clearLogs(): void {
    this.logEntries = [];
  }

  filterLogs(filterText: string): LogEntry[] {
    const lowerCaseFilterText = filterText.toLowerCase();
    return this.logEntries.filter((log) => log.msg.toLowerCase().includes(lowerCaseFilterText));
  }
}

export const commonLogsStore = new CommonLogsStore();

export const commonLogsStoreTransport: transportFunctionType<{}> = (props: LogEntry) => {
  commonLogsStore.addLog(props);
};
