export const NO_OP: VoidFunction = () => {};

export const isNullish = (value: unknown): value is null | undefined => value === null || value === undefined;

export const isNumber = (optionalNumber?: unknown | null): optionalNumber is number => {
  if (isNullish(optionalNumber)) {
    return false;
  }

  if (typeof optionalNumber !== 'number') {
    return false;
  }

  if (isNaN(optionalNumber)) {
    return false;
  }

  return true;
};
