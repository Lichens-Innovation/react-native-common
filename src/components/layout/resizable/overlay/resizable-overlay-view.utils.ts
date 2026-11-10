import { isNullish } from '@lichens-innovation/ts-common';
import type { LayoutChangeEvent, ViewStyle } from 'react-native';
import { assertFiniteRatioInUnitRange, assertRatioBoundsOrdering } from '../resizable-view.utils';
import { RESIZE_HANDLE } from '../resizable-view.constants';
import type { ResizableOverlayViewAnchorType, ResizableOverlayViewProps } from './resizable-overlay-view.types';

const OVERLAY_ANCHOR_STYLES: Record<ResizableOverlayViewAnchorType, ViewStyle> = {
  topLeft: { top: 0, left: 0 },
  topRight: { top: 0, right: 0 },
  bottomLeft: { bottom: 0, left: 0 },
  bottomRight: { bottom: 0, right: 0 },
};

export const getOverlayAnchor = (anchorType: ResizableOverlayViewAnchorType) => ({
  anchorStyle: OVERLAY_ANCHOR_STYLES[anchorType],
  isBottomAnchored: ['bottomLeft', 'bottomRight'].includes(anchorType),
  isLeftAnchored: ['topLeft', 'bottomLeft'].includes(anchorType),
});

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

interface FitOverlayToAspectRatioArgs {
  overlayHeight: number;
  containerWidth: number;
  minHeight: number;
  aspectRatio?: number;
}

export interface OverlaySize {
  height: number;
  width?: number;
}

export const fitOverlayToAspectRatio = ({
  overlayHeight,
  containerWidth,
  minHeight,
  aspectRatio,
}: FitOverlayToAspectRatioArgs): OverlaySize => {
  'worklet';
  if (aspectRatio === undefined) {
    return { height: overlayHeight };
  }

  const widthAtCurrentHeight = overlayHeight * aspectRatio;
  if (widthAtCurrentHeight > containerWidth) {
    return { height: Math.max(containerWidth / aspectRatio, minHeight), width: containerWidth };
  }

  return { height: overlayHeight, width: widthAtCurrentHeight };
};

interface ComputeOverlayHandlePositionArgs {
  overlaySize: OverlaySize;
  containerWidth: number;
  containerHeight: number;
  isLeftAnchored: boolean;
  isBottomAnchored: boolean;
}

export const computeOverlayHandlePosition = ({
  overlaySize,
  containerWidth,
  containerHeight,
  isLeftAnchored,
  isBottomAnchored,
}: ComputeOverlayHandlePositionArgs) => {
  'worklet';
  const width = overlaySize.width ?? containerWidth;
  // Always compute an explicit `left` to avoid stale left/right values when `anchorType` changes. habit-hooks-disable non-essential-comment
  const left = isLeftAnchored ? 0 : Math.max(0, containerWidth - width);
  const overlayEdgeY = isBottomAnchored ? containerHeight - overlaySize.height : overlaySize.height;

  return { top: overlayEdgeY - RESIZE_HANDLE.dragTargetCrossAxis / 2, width, left };
};

const assertPositiveAspectRatio = (aspectRatio?: number) => {
  if (!isNullish(aspectRatio) && (!Number.isFinite(aspectRatio) || aspectRatio <= 0)) {
    throw new Error('foregroundContentAspectRatio must be greater than 0. Provided: ' + aspectRatio);
  }
};

export const validateResizableOverlayProps = ({
  foregroundContentAspectRatio,
  initialForegroundRatio,
  minForegroundRatio,
  maxForegroundRatio,
}: ResizableOverlayViewProps) => {
  const initial = { name: 'initialForegroundRatio', value: initialForegroundRatio };
  const min = { name: 'minForegroundRatio', value: minForegroundRatio };
  const max = { name: 'maxForegroundRatio', value: maxForegroundRatio };

  assertPositiveAspectRatio(foregroundContentAspectRatio);
  assertFiniteRatioInUnitRange(initial);
  assertFiniteRatioInUnitRange(min);
  assertFiniteRatioInUnitRange(max);
  assertRatioBoundsOrdering({ initial, min, max });
};
