import { makeAutoObservable, observable } from 'mobx';
import { transportFunctionType } from 'react-native-logs';
import { LogEntry } from '../logger/logger.types';

const MAX_LOG_ENTRIES = 2000;

// Circular buffer keeps in-memory log retention bounded with O(1) writes.
// Array.prototype.shift() at cap is O(n) and dominates CPU during log storms.
class CommonLogsStore {
  buffer: (LogEntry | null)[] = new Array(MAX_LOG_ENTRIES).fill(null);
  head = 0;
  size = 0;

  constructor() {
    // buffer is shallow — entries are plain { msg, level } and don't need deep proxying.
    makeAutoObservable(this, { buffer: observable.shallow });
  }

  get logEntries(): LogEntry[] {
    if (this.size === 0) return [];
    if (this.size < MAX_LOG_ENTRIES) {
      return this.buffer.slice(0, this.size) as LogEntry[];
    }
    // Buffer is full → oldest entry sits at `head`, wrap to reconstruct chronological order.
    return [...(this.buffer.slice(this.head) as LogEntry[]), ...(this.buffer.slice(0, this.head) as LogEntry[])];
  }

  get allLogsAsText(): string {
    return this.logEntries
      .map((log) => log.msg)
      .filter((log) => !!log)
      .join('\n');
  }

  addLog(logEntry: LogEntry): void {
    this.buffer[this.head] = logEntry;
    this.head = (this.head + 1) % MAX_LOG_ENTRIES;
    if (this.size < MAX_LOG_ENTRIES) this.size++;
  }

  clearLogs(): void {
    this.buffer = new Array(MAX_LOG_ENTRIES).fill(null);
    this.head = 0;
    this.size = 0;
  }

  filterLogs(filterText: string): LogEntry[] {
    const lowerCaseFilterText = filterText.toLowerCase();
    return this.logEntries.filter((log) => log.msg.toLowerCase().includes(lowerCaseFilterText));
  }
}

export const commonLogsStore = new CommonLogsStore();

// Strip rawMsg (caller args by reference). The formatted `msg` string is sufficient
// for DevLogs display and prevents the in-memory buffer from retaining heavy objects
// (full Error instances, sync row payloads, React component stacks). Sentry and the
// file transport receive the original LogEntry directly from the logger and are unaffected.
export const commonLogsStoreTransport: transportFunctionType<object> = (props: LogEntry) => {
  commonLogsStore.addLog({ msg: props.msg, level: props.level, rawMsg: undefined });
};
