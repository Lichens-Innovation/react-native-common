import { logger } from './logger';
const X_REQUEST_START_TIME = 'x-request-start-time';
export const LOG_LEVELS = {
    debug: 0,
    log: 1,
    info: 2,
    warn: 3,
    error: 4,
};
export const toLogLevel = (type) => {
    const logLevelKey = type.toLowerCase();
    return {
        text: type.toUpperCase(),
        severity: LOG_LEVELS[logLevelKey],
    };
};
export const logRequestStart = (request) => {
    request.headers.set(X_REQUEST_START_TIME, Date.now().toString());
    return request;
};
export const logRequestEnd = (response) => {
    var _a;
    const { status, config } = response;
    const { method, baseURL, url } = config;
    const startTime = Number((_a = config.headers.get(X_REQUEST_START_TIME)) !== null && _a !== void 0 ? _a : 0);
    const duration = startTime ? `(${Date.now() - startTime}ms)` : '';
    const { verb, fullUrl } = buildRequestLogInfos({ baseURL, url, method });
    logger.info(`➡️ Axios ${verb} ${fullUrl} http ${status} ${duration}.`);
    return response;
};
const buildRequestLogInfos = ({ baseURL, url, method }) => {
    var _a;
    const fullUrl = `${baseURL !== null && baseURL !== void 0 ? baseURL : ''}${url !== null && url !== void 0 ? url : ''}`;
    const verb = (_a = method === null || method === void 0 ? void 0 : method.toUpperCase()) !== null && _a !== void 0 ? _a : '';
    return { verb, fullUrl };
};
//# sourceMappingURL=logger.utils.js.map