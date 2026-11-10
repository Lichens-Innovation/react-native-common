import { isNullish } from '@lichens-innovation/ts-common';

export interface NamedRatio {
  name: string;
  value?: number;
}

const isOutsideUnitRange = (value: number) => value < 0 || value > 1;

const toProvidedJson = (first: NamedRatio, second: NamedRatio) =>
  JSON.stringify({ [first.name]: first.value, [second.name]: second.value });

export const assertRatioInUnitRange = ({ name, value }: NamedRatio) => {
  if (!isNullish(value) && isOutsideUnitRange(value)) {
    throw new Error(`${name} must be between 0 and 1. Provided: ${value}`);
  }
};

export const assertFiniteRatioInUnitRange = ({ name, value }: NamedRatio) => {
  if (!isNullish(value) && (!Number.isFinite(value) || isOutsideUnitRange(value))) {
    throw new Error(`${name} must be between 0 and 1. Provided: ${value}`);
  }
};

const assertRatioLessThan = (ratio: NamedRatio, bound: NamedRatio) => {
  if (!isNullish(ratio.value) && !isNullish(bound.value) && ratio.value >= bound.value) {
    throw new Error(`${ratio.name} must be less than ${bound.name}. Provided: ${toProvidedJson(ratio, bound)}`);
  }
};

const assertRatioAtLeast = (ratio: NamedRatio, bound: NamedRatio) => {
  if (!isNullish(ratio.value) && !isNullish(bound.value) && ratio.value < bound.value) {
    throw new Error(`${ratio.name} must be >= ${bound.name}. Provided: ${toProvidedJson(ratio, bound)}`);
  }
};

const assertRatioAtMost = (ratio: NamedRatio, bound: NamedRatio) => {
  if (!isNullish(ratio.value) && !isNullish(bound.value) && ratio.value > bound.value) {
    throw new Error(`${ratio.name} must be <= ${bound.name}. Provided: ${toProvidedJson(ratio, bound)}`);
  }
};

export interface ResizableRatioBounds {
  initial: NamedRatio;
  min: NamedRatio;
  max: NamedRatio;
}

export const assertRatioBoundsOrdering = ({ initial, min, max }: ResizableRatioBounds) => {
  assertRatioLessThan(min, max);
  assertRatioAtLeast(initial, min);
  assertRatioAtMost(initial, max);
};
