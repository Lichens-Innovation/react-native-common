export interface SimpleLogger {
  debug(message: string, ...args: any[]): void;
  log(message: string, ...args: any[]): void;
  info(message: string, ...args: any[]): void;
  warn(message: string, ...args: any[]): void;
  error(message: string, ...args: any[]): void;
}

// extract names of logger methods as a type
export type LoggerMethods = keyof SimpleLogger;

export const LOG_LEVELS = {
  debug: 0,
  log: 1,
  info: 2,
  warn: 3,
  error: 4,
} as const;

export type LogLevelKey = keyof typeof LOG_LEVELS;

export interface LogLevel {
  severity: number;
  text: string;
}

export interface LogEntry {
  msg: string;
  rawMsg: unknown;
  level: LogLevel;
}
