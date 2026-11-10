import { useEffect, type FunctionComponent } from 'react';
import { LayoutChangeEvent, StyleSheet, View } from 'react-native';
import Animated, { useAnimatedStyle, useSharedValue } from 'react-native-reanimated';
import { isDevelopment } from '../../../../utils/utils.index';
import { ResizablePaneContent } from '../resizable-pane-content';
import { RESIZE_HANDLE } from '../resizable-view.constants';
import { ResizeHandle } from '../resize-handle';
import { useResizePanGesture } from '../use-resize-pan-gesture';
import { ResizableOverlayViewProps } from './resizable-overlay-view.types';
import {
  computeOverlayHandlePosition,
  computeResizableOverlayLayoutValues,
  fitOverlayToAspectRatio,
  getOverlayAnchor,
  validateResizableOverlayProps,
} from './resizable-overlay-view.utils';

export const ResizableOverlayView: FunctionComponent<ResizableOverlayViewProps> = (props) => {
  useEffect(() => {
    if (isDevelopment()) validateResizableOverlayProps(props);
  }, [props]);

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

  const { panGesture, isDragging } = useResizePanGesture({
    size: overlayHeight,
    minSize: minHeight,
    maxSize: maxHeight,
    axis: 'y',
    sizeChangePerDragUnit: isBottomAnchored ? -1 : 1,
  });

  const fitOverlay = () => {
    'worklet';
    return fitOverlayToAspectRatio({
      overlayHeight: overlayHeight.value,
      containerWidth: containerWidth.value,
      minHeight: minHeight.value,
      aspectRatio: foregroundContentAspectRatio,
    });
  };

  const overlayAnimatedStyle = useAnimatedStyle(() => {
    const { height, width } = fitOverlay();
    return width !== undefined ? { height, width } : { height };
  });

  const dragHandleContainerAnimatedStyle = useAnimatedStyle(
    () =>
      computeOverlayHandlePosition({
        overlaySize: fitOverlay(),
        containerWidth: containerWidth.value,
        containerHeight: containerHeight.value,
        isLeftAnchored,
        isBottomAnchored,
      }),
    [foregroundContentAspectRatio, isBottomAnchored, isLeftAnchored]
  );

  return (
    <View style={styles.container} onLayout={handleLayout}>
      <View style={styles.backgroundSection}>
        <ResizablePaneContent
          shouldObscureWhileResizing={shouldObscureBackgroundPaneContentWhileResizing}
          isDragging={isDragging}
          isLayoutReady={isLayoutReady}
          greyLevel="primary"
        >
          {backgroundContent}
        </ResizablePaneContent>
      </View>

      <Animated.View style={[styles.overlaySection, anchorStyle, overlayAnimatedStyle]}>
        <ResizablePaneContent
          shouldObscureWhileResizing={shouldObscureForegroundPaneContentWhileResizing}
          isDragging={isDragging}
          isLayoutReady={isLayoutReady}
          greyLevel="secondary"
        >
          {foregroundContent}
        </ResizablePaneContent>
      </Animated.View>

      {!hideHandle && (
        <ResizeHandle
          gesture={panGesture}
          isDragging={isDragging}
          barOrientation="horizontal"
          containerStyle={[styles.handleContainer, handleContainerStyle, dragHandleContainerAnimatedStyle]}
          handleStyle={handleStyle}
        />
      )}
    </View>
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
