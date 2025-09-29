import { type AxiosResponse, type InternalAxiosRequestConfig } from 'axios';
export declare const LOG_LEVELS: {
    readonly debug: 0;
    readonly log: 1;
    readonly info: 2;
    readonly warn: 3;
    readonly error: 4;
};
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
export declare const toLogLevel: (type: string) => LogLevel;
export interface SimpleLogger {
    debug(message: string, ...args: any[]): void;
    log(message: string, ...args: any[]): void;
    info(message: string, ...args: any[]): void;
    warn(message: string, ...args: any[]): void;
    error(message: string, ...args: any[]): void;
}
export type LoggerMethods = keyof SimpleLogger;
export declare const logRequestStart: (request: InternalAxiosRequestConfig) => InternalAxiosRequestConfig<any>;
export declare const logRequestEnd: (response: AxiosResponse) => AxiosResponse<any, any>;
