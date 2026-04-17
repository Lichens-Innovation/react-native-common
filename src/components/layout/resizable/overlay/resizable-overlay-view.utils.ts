import { isNullish } from '@lichens-innovation/ts-common';
import type { LayoutChangeEvent } from 'react-native';

import type { ResizableOverlayViewProps } from './resizable-overlay-view.types';

interface ComputeResizableOverlayLayoutValuesArgs {
  event: LayoutChangeEvent;
  initialForegroundRatio: number;
  minForegroundRatio: number;
  maxForegroundRatio: number;
  foregroundContentAspectRatio?: number;
}

export const computeResizableOverlayLayoutValues = ({
  event,
  initialForegroundRatio,
  minForegroundRatio,
  maxForegroundRatio,
  foregroundContentAspectRatio,
}: ComputeResizableOverlayLayoutValuesArgs) => {
  const { height, width } = event.nativeEvent.layout;
  if (height <= 0) return { containerHeight: 0, containerWidth: 0, minHeight: 0, maxHeight: 0, overlayHeight: 0 };

  // Always keep container & bounds updated (layout can change over time).
  const computedMinHeight = height * minForegroundRatio;
  const computedMaxHeightFromContainer = height * maxForegroundRatio;
  const computedMaxHeightFromAspectRatio =
    foregroundContentAspectRatio !== undefined ? width / foregroundContentAspectRatio : Number.POSITIVE_INFINITY;
  const computedMaxHeight = Math.max(
    computedMinHeight,
    Math.min(computedMaxHeightFromContainer, computedMaxHeightFromAspectRatio)
  );

  const computedOverlayHeight = Math.max(
    computedMinHeight,
    Math.min(height * initialForegroundRatio, computedMaxHeight)
  );

  return {
    containerHeight: height,
    containerWidth: width,
    minHeight: computedMinHeight,
    maxHeight: computedMaxHeight,
    overlayHeight: computedOverlayHeight,
  };
};

export const validateResizableOverlayProps = (props: ResizableOverlayViewProps) => {
  const { foregroundContentAspectRatio, initialForegroundRatio, minForegroundRatio, maxForegroundRatio } = props;

  if (!isNullish(foregroundContentAspectRatio)) {
    if (!Number.isFinite(foregroundContentAspectRatio) || foregroundContentAspectRatio <= 0)
      throw new Error('foregroundContentAspectRatio must be greater than 0. Provided: ' + foregroundContentAspectRatio);
  }

  if (!isNullish(initialForegroundRatio)) {
    if (!Number.isFinite(initialForegroundRatio) || initialForegroundRatio < 0 || initialForegroundRatio > 1)
      throw new Error(`initialForegroundRatio must be between 0 and 1. Provided: ${initialForegroundRatio}`);
  }

  if (!isNullish(minForegroundRatio)) {
    if (!Number.isFinite(minForegroundRatio) || minForegroundRatio < 0 || minForegroundRatio > 1)
      throw new Error(`minForegroundRatio must be between 0 and 1. Provided: ${minForegroundRatio}`);
  }

  if (!isNullish(maxForegroundRatio)) {
    if (!Number.isFinite(maxForegroundRatio) || maxForegroundRatio < 0 || maxForegroundRatio > 1)
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
