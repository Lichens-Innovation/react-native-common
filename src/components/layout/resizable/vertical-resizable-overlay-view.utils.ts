import { isNullish } from '@lichens-innovation/ts-common';
import { VerticalResizableOverlayViewProps } from './vertical-resizable-overlay-view.types';

export const validateResizableOverlayProps = (props: VerticalResizableOverlayViewProps) => {
  const { foregroundContentAspectRatio, initialForegroundRatio, minForegroundRatio, maxForegroundRatio } = props;

  if (!isNullish(foregroundContentAspectRatio)) {
    if (foregroundContentAspectRatio <= 0)
      throw new Error('foregroundContentAspectRatio must be greater than 0. Provided: ' + foregroundContentAspectRatio);
  }

  if (!isNullish(initialForegroundRatio)) {
    if (initialForegroundRatio < 0 || initialForegroundRatio > 1)
      throw new Error(`initialForegroundRatio must be between 0 and 1. Provided: ${initialForegroundRatio}`);
  }

  if (!isNullish(minForegroundRatio)) {
    if (minForegroundRatio < 0 || minForegroundRatio > 1)
      throw new Error(`minForegroundRatio must be between 0 and 1. Provided: ${minForegroundRatio}`);
  }

  if (!isNullish(maxForegroundRatio)) {
    if (maxForegroundRatio < 0 || maxForegroundRatio > 1)
      throw new Error(`maxForegroundRatio must be between 0 and 1. Provided: ${maxForegroundRatio}`);
  }

  if (!isNullish(minForegroundRatio) && !isNullish(maxForegroundRatio) && minForegroundRatio >= maxForegroundRatio)
    throw new Error(
      `minForegroundRatio must be less than maxForegroundRatio. Provided: ${JSON.stringify({ minForegroundRatio, maxForegroundRatio })}`
    );

  if (
    !isNullish(initialForegroundRatio) &&
    !isNullish(minForegroundRatio) &&
    initialForegroundRatio < minForegroundRatio
  )
    throw new Error(
      `initialForegroundRatio must be >= minForegroundRatio. Provided: ${JSON.stringify({ initialForegroundRatio, minForegroundRatio })}`
    );

  if (
    !isNullish(initialForegroundRatio) &&
    !isNullish(maxForegroundRatio) &&
    initialForegroundRatio > maxForegroundRatio
  )
    throw new Error(
      `initialForegroundRatio must be <= maxForegroundRatio. Provided: ${JSON.stringify({ initialForegroundRatio, maxForegroundRatio })}`
    );
};
