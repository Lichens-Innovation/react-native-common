export const NO_OP: VoidFunction = () => {};

export const isNullish = (value: unknown): value is null | undefined => value === null || value === undefined;

export const isNumber = (optionalNumber?: number | null): optionalNumber is number => {
  return !isNullish(optionalNumber) && typeof optionalNumber === 'number' && !isNaN(optionalNumber);
};
