import { type AxiosResponse, type InternalAxiosRequestConfig } from 'axios';
import { logger } from './logger';

const X_REQUEST_START_TIME = 'x-request-start-time';

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

export const toLogLevel = (type: string): LogLevel => {
  const logLevelKey = type.toLowerCase() as LogLevelKey;

  return {
    text: type.toUpperCase(),
    severity: LOG_LEVELS[logLevelKey],
  };
};

export interface SimpleLogger {
  debug(message: string, ...args: any[]): void;
  log(message: string, ...args: any[]): void;
  info(message: string, ...args: any[]): void;
  warn(message: string, ...args: any[]): void;
  error(message: string, ...args: any[]): void;
}

// extract names of logger methods as a type
export type LoggerMethods = keyof SimpleLogger;

export const logRequestStart = (request: InternalAxiosRequestConfig) => {
  request.headers.set(X_REQUEST_START_TIME, Date.now().toString());
  return request;
};

export const sanitizeUrl = (url?: string | null) => {
  if (!url) return url;

  // remove any user:password@ from the url
  const regExp = /http:\/\/(.*):(.*)@(.*)/;
  const isMatching = url.match(regExp);
  return isMatching ? `http://${isMatching[3]}` : url;
};

export const logRequestEnd = (response: AxiosResponse) => {
  const { status, config } = response;
  const { method, baseURL, url } = config;

  const startTime = Number(config.headers.get(X_REQUEST_START_TIME) ?? 0);
  const duration = startTime ? `(${Date.now() - startTime}ms)` : '';

  const { verb, fullUrl } = buildRequestLogInfos({ baseURL, url, method });
  const sanitizedUrl = sanitizeUrl(fullUrl);
  logger.info(`➡️ Axios ${verb} ${sanitizedUrl} http ${status} ${duration}.`);

  return response;
};

type BuildRequestLogInfosArgs = {
  baseURL?: string;
  url?: string;
  method?: string;
};
const buildRequestLogInfos = ({ baseURL, url, method }: BuildRequestLogInfosArgs) => {
  const fullUrl = `${baseURL ?? ''}${url ?? ''}`;
  const verb = method?.toUpperCase() ?? '';

  return { verb, fullUrl };
};
