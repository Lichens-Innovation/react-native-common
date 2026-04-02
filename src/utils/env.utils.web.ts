import { logger } from '../logger/logger';

export const isProduction = (): boolean => {
  if (__DEV__) {
    return false;
  }

  return true;
};

export const isPreview = (): boolean => {
  return false;
};

export const isDevelopment = (): boolean => !isProduction();

export const getEnvVarsSource = (): string => {
  return 'web';
};

export const validateGetRandomValues = (): boolean => {
  if (!crypto?.getRandomValues) {
    logger.error('[validateGetRandomValues] crypto.getRandomValues is not available as a global environment function');
    return false;
  }

  const typeOfGetRandomValues = typeof crypto.getRandomValues;
  if (typeOfGetRandomValues !== 'function') {
    logger.error(`[validateGetRandomValues] crypto.getRandomValues is not a function: ${typeOfGetRandomValues}`);
    return false;
  }

  logger.debug('[validateGetRandomValues] global crypto getRandomValues is available as a global environment function');
  return true;
};
