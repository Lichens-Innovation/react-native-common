import { useCallback, useEffect, type FunctionComponent } from 'react';
import { LayoutChangeEvent, StyleSheet, View } from 'react-native';
import Animated, { useAnimatedStyle, useSharedValue } from 'react-native-reanimated';
import { isDevelopment } from '../../../../utils/utils.index';
import { ResizablePaneContent } from '../resizable-pane-content';
import { RESIZE_HANDLE } from '../resizable-view.constants';
import { ResizeHandle } from '../resize-handle';
import { useResizePanGesture } from '../use-resize-pan-gesture';
import { VerticalResizableSplitViewProps } from './vertical-resizable-split-view.types';
import { validateResizableSplitViewProps } from './vertical-resizable-split-view.utils';

export const VerticalResizableSplitView: FunctionComponent<VerticalResizableSplitViewProps> = (props) => {
  useEffect(() => {
    if (isDevelopment()) validateResizableSplitViewProps(props);
  }, [props]);

  const {
    topContent,
    bottomContent,
    initialTopRatio = 0.5,
    minTopRatio = 0.15,
    maxTopRatio = 0.85,
    handleContainerStyle,
    handleStyle,
    hideHandle = false,
    shouldObscureTopPaneContentWhileResizing = false,
    shouldObscureBottomPaneContentWhileResizing = false,
  } = props;

  const containerHeight = useSharedValue(0);
  const topSectionHeight = useSharedValue(0);
  const minHeight = useSharedValue(0);
  const maxHeight = useSharedValue(0);
  const isLayoutReady = useSharedValue(false);

  const handleLayout = useCallback(
    (event: LayoutChangeEvent) => {
      const { height } = event.nativeEvent.layout;
      if (height > 0 && !isLayoutReady.value) {
        containerHeight.set(height);
        minHeight.set(height * minTopRatio);
        maxHeight.set(height * maxTopRatio);
        topSectionHeight.set(height * initialTopRatio);
        isLayoutReady.set(true);
      }
    },
    [minTopRatio, maxTopRatio, initialTopRatio, containerHeight, minHeight, maxHeight, topSectionHeight, isLayoutReady]
  );

  const { panGesture, isDragging } = useResizePanGesture({
    size: topSectionHeight,
    minSize: minHeight,
    maxSize: maxHeight,
    axis: 'y',
  });

  const topSectionAnimatedStyle = useAnimatedStyle(() => ({ height: topSectionHeight.value }));

  const bottomSectionAnimatedStyle = useAnimatedStyle(() => ({
    height: containerHeight.value - topSectionHeight.value,
  }));

  const dragHandleContainerAnimatedStyle = useAnimatedStyle(() => ({
    top: topSectionHeight.value - RESIZE_HANDLE.dragTargetCrossAxis / 2,
  }));

  return (
    <View style={styles.container} onLayout={handleLayout}>
      <Animated.View style={[styles.topSection, topSectionAnimatedStyle]}>
        <ResizablePaneContent
          shouldObscureWhileResizing={shouldObscureTopPaneContentWhileResizing}
          isDragging={isDragging}
          isLayoutReady={isLayoutReady}
          greyLevel="primary"
        >
          {topContent}
        </ResizablePaneContent>
      </Animated.View>

      <Animated.View style={[styles.bottomSection, bottomSectionAnimatedStyle]}>
        <ResizablePaneContent
          shouldObscureWhileResizing={shouldObscureBottomPaneContentWhileResizing}
          isDragging={isDragging}
          isLayoutReady={isLayoutReady}
          greyLevel="secondary"
        >
          {bottomContent}
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
  container: {
    flex: 1,
  },
  topSection: {
    overflow: 'hidden',
  },
  bottomSection: {
    overflow: 'hidden',
  },
  handleContainer: {
    position: 'absolute',
    left: 0,
    right: 0,
    height: RESIZE_HANDLE.dragTargetCrossAxis,
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 1,
    elevation: 1,
  },
});
