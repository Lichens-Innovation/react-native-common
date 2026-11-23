import { type FunctionComponent } from 'react';
import { LayoutChangeEvent, StyleSheet } from 'react-native';
import { useAnimatedStyle, useSharedValue } from 'react-native-reanimated';
import { ResizablePaneLayout } from '../resizable-pane-layout';
import { RESIZE_HANDLE } from '../resizable-view.constants';
import { useDevPropsValidation } from '../use-dev-props-validation';
import { ResizableOverlayViewProps } from './resizable-overlay-view.types';
import {
  computeOverlayHandlePosition,
  computeResizableOverlayLayoutValues,
  fitOverlayToAspectRatio,
  getOverlayAnchor,
  validateResizableOverlayProps,
} from './resizable-overlay-view.utils';

export const ResizableOverlayView: FunctionComponent<ResizableOverlayViewProps> = (props) => {
  useDevPropsValidation(props, validateResizableOverlayProps);

  const {
    foregroundContent,
    backgroundContent,
    initialForegroundRatio = 0.5,
    minForegroundRatio = 0.15,
    maxForegroundRatio = 0.85,
    foregroundContentAspectRatio,
    handleContainerStyle,
    handleStyle,
    hideHandle = false,
    anchorType = 'topRight',
    shouldObscureForegroundPaneContentWhileResizing = false,
    shouldObscureBackgroundPaneContentWhileResizing = false,
  } = props;

  const { anchorStyle, isBottomAnchored, isLeftAnchored } = getOverlayAnchor(anchorType);

  const overlayHeight = useSharedValue(0);
  const containerHeight = useSharedValue(0);
  const containerWidth = useSharedValue(0);
  const minHeight = useSharedValue(0);
  const maxHeight = useSharedValue(0);
  const isLayoutReady = useSharedValue(false);

  const handleLayout = (event: LayoutChangeEvent) => {
    const computedValues = computeResizableOverlayLayoutValues({
      event,
      initialForegroundRatio,
      minForegroundRatio,
      maxForegroundRatio,
      foregroundContentAspectRatio,
    });

    containerHeight.set(computedValues.containerHeight);
    containerWidth.set(computedValues.containerWidth);
    minHeight.set(computedValues.minHeight);
    maxHeight.set(computedValues.maxHeight);
    overlayHeight.set(computedValues.overlayHeight);
    isLayoutReady.set(true);
  };

  // Read shared values directly in each updater: Reanimated only tracks those in the updater's own closure, habit-hooks-disable non-essential-comment
  // not those hidden behind a nested worklet function (the style would never update). habit-hooks-disable non-essential-comment
  const overlayAnimatedStyle = useAnimatedStyle(() => {
    const { height, width } = fitOverlayToAspectRatio({
      overlayHeight: overlayHeight.value,
      containerWidth: containerWidth.value,
      minHeight: minHeight.value,
      aspectRatio: foregroundContentAspectRatio,
    });
    return width !== undefined ? { height, width } : { height };
  });

  const dragHandleContainerAnimatedStyle = useAnimatedStyle(() =>
    computeOverlayHandlePosition({
      overlaySize: fitOverlayToAspectRatio({
        overlayHeight: overlayHeight.value,
        containerWidth: containerWidth.value,
        minHeight: minHeight.value,
        aspectRatio: foregroundContentAspectRatio,
      }),
      containerWidth: containerWidth.value,
      containerHeight: containerHeight.value,
      isLeftAnchored,
      isBottomAnchored,
    })
  );

  return (
    <ResizablePaneLayout
      style={styles.container}
      onLayout={handleLayout}
      firstPane={{
        content: backgroundContent,
        style: styles.backgroundSection,
        shouldObscureWhileResizing: shouldObscureBackgroundPaneContentWhileResizing,
      }}
      secondPane={{
        content: foregroundContent,
        style: [styles.overlaySection, anchorStyle, overlayAnimatedStyle],
        shouldObscureWhileResizing: shouldObscureForegroundPaneContentWhileResizing,
      }}
      isLayoutReady={isLayoutReady}
      resize={{
        size: overlayHeight,
        minSize: minHeight,
        maxSize: maxHeight,
        axis: 'y',
        sizeChangePerDragUnit: isBottomAnchored ? -1 : 1,
      }}
      handle={{
        isHidden: hideHandle,
        barOrientation: 'horizontal',
        containerStyle: [styles.handleContainer, handleContainerStyle, dragHandleContainerAnimatedStyle],
        handleStyle,
      }}
    />
  );
};

const styles = StyleSheet.create({
  container: { flex: 1 },
  backgroundSection: { flex: 1 },
  overlaySection: { position: 'absolute', overflow: 'hidden' },
  handleContainer: {
    position: 'absolute',
    height: RESIZE_HANDLE.dragTargetCrossAxis,
    alignItems: 'center',
    justifyContent: 'center',
  },
});
