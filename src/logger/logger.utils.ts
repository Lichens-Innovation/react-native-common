import { isBlank } from '@lichens-innovation/ts-common';
import { type AxiosResponse, type InternalAxiosRequestConfig } from 'axios';
import { logger } from './logger';
import { LOG_LEVELS, LogLevel, LogLevelKey } from './logger.types';

const X_REQUEST_START_TIME = 'x-request-start-time';

export const toLogLevel = (type: string): LogLevel => {
  const logLevelKey = type.toLowerCase() as LogLevelKey;

  return {
    text: type.toUpperCase(),
    severity: LOG_LEVELS[logLevelKey],
  };
};

export const logRequestStart = (request: InternalAxiosRequestConfig) => {
  request.headers.set(X_REQUEST_START_TIME, Date.now().toString());
  return request;
};

export const sanitizeUrl = (url?: string | null) => {
  if (isBlank(url)) return url;

  const credentialsInUrlRegExp = /http:\/\/(.*):(.*)@(.*)/;
  const isMatching = url.match(credentialsInUrlRegExp);
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

interface BuildRequestLogInfosArgs {
  baseURL?: string;
  url?: string;
  method?: string;
}
const buildRequestLogInfos = ({ baseURL, url, method }: BuildRequestLogInfosArgs) => {
  const fullUrl = `${baseURL ?? ''}${url ?? ''}`;
  const verb = method?.toUpperCase() ?? '';

  return { verb, fullUrl };
};
