import { isNullish } from '@lichens-innovation/ts-common';
import { HorizontalResizableSplitViewProps } from './horizontal-resizable-split-view.types';

export const validateResizableSplitViewProps = (props: HorizontalResizableSplitViewProps) => {
  const { initialLeftRatio, minLeftRatio, maxLeftRatio } = props;

  if (!isNullish(initialLeftRatio)) {
    if (initialLeftRatio < 0 || initialLeftRatio > 1)
      throw new Error(`initialLeftRatio must be between 0 and 1. Provided: ${initialLeftRatio}`);
  }

  if (!isNullish(minLeftRatio)) {
    if (minLeftRatio < 0 || minLeftRatio > 1)
      throw new Error(`minLeftRatio must be between 0 and 1. Provided: ${minLeftRatio}`);
  }

  if (!isNullish(maxLeftRatio)) {
    if (maxLeftRatio < 0 || maxLeftRatio > 1)
      throw new Error(`maxLeftRatio must be between 0 and 1. Provided: ${maxLeftRatio}`);
  }

  if (!isNullish(minLeftRatio) && !isNullish(maxLeftRatio) && minLeftRatio >= maxLeftRatio)
    throw new Error(
      `minLeftRatio must be less than maxLeftRatio. Provided: ${JSON.stringify({ minLeftRatio, maxLeftRatio })}`
    );

  if (!isNullish(initialLeftRatio) && !isNullish(minLeftRatio) && initialLeftRatio < minLeftRatio)
    throw new Error(
      `initialLeftRatio must be >= minLeftRatio. Provided: ${JSON.stringify({ initialLeftRatio, minLeftRatio })}`
    );

  if (!isNullish(initialLeftRatio) && !isNullish(maxLeftRatio) && initialLeftRatio > maxLeftRatio)
    throw new Error(
      `initialLeftRatio must be <= maxLeftRatio. Provided: ${JSON.stringify({ initialLeftRatio, maxLeftRatio })}`
    );
};
