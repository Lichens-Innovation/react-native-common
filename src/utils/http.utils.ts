import { isNullish } from './types.utils';

export const isHttpSuccessStatus = (status?: number | null): boolean => {
  if (isNullish(status)) {
    return false;
  }

  return status >= 200 && status < 300;
};

export const isHttpClientErrorStatus = (status?: number | null): boolean => {
  if (isNullish(status)) {
    return false;
  }

  return status >= 400 && status < 500;
};

export const isHttpServerErrorStatus = (status?: number | null): boolean => {
  if (isNullish(status)) {
    return false;
  }

  return status >= 500;
};
