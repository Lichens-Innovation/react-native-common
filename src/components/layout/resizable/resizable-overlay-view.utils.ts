import type { LayoutChangeEvent } from 'react-native';

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
