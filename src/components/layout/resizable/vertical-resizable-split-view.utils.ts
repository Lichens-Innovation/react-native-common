import { isNullish } from '@lichens-innovation/ts-common';
import { VerticalResizableSplitViewProps } from './vertical-resizable-split-view.types';

export const validateResizableSplitViewProps = (props: VerticalResizableSplitViewProps) => {
  const { initialTopRatio, minTopRatio, maxTopRatio } = props;

  if (!isNullish(initialTopRatio)) {
    if (initialTopRatio < 0 || initialTopRatio > 1)
      throw new Error(`initialTopRatio must be between 0 and 1. Provided: ${initialTopRatio}`);
  }

  if (!isNullish(minTopRatio)) {
    if (minTopRatio < 0 || minTopRatio > 1)
      throw new Error(`minTopRatio must be between 0 and 1. Provided: ${minTopRatio}`);
  }

  if (!isNullish(maxTopRatio)) {
    if (maxTopRatio < 0 || maxTopRatio > 1)
      throw new Error(`maxTopRatio must be between 0 and 1. Provided: ${maxTopRatio}`);
  }

  if (!isNullish(minTopRatio) && !isNullish(maxTopRatio) && minTopRatio >= maxTopRatio)
    throw new Error(
      `minTopRatio must be less than maxTopRatio. Provided: ${JSON.stringify({ minTopRatio, maxTopRatio })}`
    );

  if (!isNullish(initialTopRatio) && !isNullish(minTopRatio) && initialTopRatio < minTopRatio)
    throw new Error(
      `initialTopRatio must be >= minTopRatio. Provided: ${JSON.stringify({ initialTopRatio, minTopRatio })}`
    );

  if (!isNullish(initialTopRatio) && !isNullish(maxTopRatio) && initialTopRatio > maxTopRatio)
    throw new Error(
      `initialTopRatio must be <= maxTopRatio. Provided: ${JSON.stringify({ initialTopRatio, maxTopRatio })}`
    );
};
