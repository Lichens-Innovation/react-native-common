export const NO_OP: VoidFunction = () => {};

export const isNullish = (value: unknown): value is null | undefined => value === null || value === undefined;

export const isNumber = (value?: unknown | null): value is number => {
  if (isNullish(value)) {
    return false;
  }

  if (typeof value !== 'number') {
    return false;
  }

  if (isNaN(value)) {
    return false;
  }

  return true;
};

export const isString = (value?: unknown | null): value is string => {
  if (isNullish(value)) {
    return false;
  }

  if (typeof value !== 'string') {
    return false;
  }

  return true;
};
