import { useCallback, useEffect, type FunctionComponent } from 'react';
import { LayoutChangeEvent, StyleSheet, View } from 'react-native';
import Animated, { useAnimatedStyle, useSharedValue } from 'react-native-reanimated';
import { isDevelopment } from '../../../../utils/utils.index';
import { ResizablePaneContent } from '../resizable-pane-content';
import { RESIZE_HANDLE } from '../resizable-view.constants';
import { ResizeHandle } from '../resize-handle';
import { useResizePanGesture } from '../use-resize-pan-gesture';
import { HorizontalResizableSplitViewProps } from './horizontal-resizable-split-view.types';
import { validateResizableSplitViewProps } from './horizontal-resizable-split-view.utils';

export const HorizontalResizableSplitView: FunctionComponent<HorizontalResizableSplitViewProps> = (props) => {
  useEffect(() => {
    if (isDevelopment()) validateResizableSplitViewProps(props);
  }, [props]);

  const {
    leftContent,
    rightContent,
    initialLeftRatio = 0.5,
    minLeftRatio = 0.15,
    maxLeftRatio = 0.85,
    handleContainerStyle,
    handleStyle,
    hideHandle = false,
    shouldObscureLeftPaneContentWhileResizing = false,
    shouldObscureRightPaneContentWhileResizing = false,
  } = props;

  const containerWidth = useSharedValue(0);
  const leftSectionWidth = useSharedValue(0);
  const minWidth = useSharedValue(0);
  const maxWidth = useSharedValue(0);
  const isLayoutReady = useSharedValue(false);

  const handleLayout = useCallback(
    (event: LayoutChangeEvent) => {
      const { width } = event.nativeEvent.layout;
      if (width > 0 && !isLayoutReady.value) {
        containerWidth.set(width);
        minWidth.set(width * minLeftRatio);
        maxWidth.set(width * maxLeftRatio);
        leftSectionWidth.set(width * initialLeftRatio);
        isLayoutReady.set(true);
      }
    },
    [minLeftRatio, maxLeftRatio, initialLeftRatio, containerWidth, minWidth, maxWidth, leftSectionWidth, isLayoutReady]
  );

  const { panGesture, isDragging } = useResizePanGesture({
    size: leftSectionWidth,
    minSize: minWidth,
    maxSize: maxWidth,
    axis: 'x',
  });

  const leftSectionAnimatedStyle = useAnimatedStyle(() => ({ width: leftSectionWidth.value }));

  const rightSectionAnimatedStyle = useAnimatedStyle(() => ({
    width: containerWidth.value - leftSectionWidth.value,
  }));

  const dragHandleContainerAnimatedStyle = useAnimatedStyle(() => ({
    left: leftSectionWidth.value - RESIZE_HANDLE.dragTargetCrossAxis / 2,
  }));

  return (
    <View style={styles.container} onLayout={handleLayout}>
      <Animated.View style={[styles.leftSection, leftSectionAnimatedStyle]}>
        <ResizablePaneContent
          shouldObscureWhileResizing={shouldObscureLeftPaneContentWhileResizing}
          isDragging={isDragging}
          isLayoutReady={isLayoutReady}
          greyLevel="primary"
        >
          {leftContent}
        </ResizablePaneContent>
      </Animated.View>

      <Animated.View style={[styles.rightSection, rightSectionAnimatedStyle]}>
        <ResizablePaneContent
          shouldObscureWhileResizing={shouldObscureRightPaneContentWhileResizing}
          isDragging={isDragging}
          isLayoutReady={isLayoutReady}
          greyLevel="secondary"
        >
          {rightContent}
        </ResizablePaneContent>
      </Animated.View>

      {!hideHandle && (
        <ResizeHandle
          gesture={panGesture}
          isDragging={isDragging}
          barOrientation="vertical"
          containerStyle={[styles.handleContainer, handleContainerStyle, dragHandleContainerAnimatedStyle]}
          handleStyle={handleStyle}
        />
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    flexDirection: 'row',
  },
  leftSection: {
    overflow: 'hidden',
  },
  rightSection: {
    overflow: 'hidden',
  },
  handleContainer: {
    position: 'absolute',
    top: 0,
    bottom: 0,
    width: RESIZE_HANDLE.dragTargetCrossAxis,
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 1,
    elevation: 1,
  },
});
