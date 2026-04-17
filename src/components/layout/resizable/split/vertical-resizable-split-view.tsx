import { useCallback, useEffect, type FunctionComponent } from 'react';
import { LayoutChangeEvent, StyleSheet, View } from 'react-native';
import { Gesture, GestureDetector } from 'react-native-gesture-handler';
import Animated, { useAnimatedStyle, useSharedValue, withSpring } from 'react-native-reanimated';
import { useAppTheme } from '../../../../theme';
import { isDevelopment } from '../../../../utils';
import { ResizablePaneDragChrome } from '../resizable-pane-drag-chrome';
import { RESIZE_HANDLE } from '../resizable-view.constants';
import { VerticalResizableSplitViewProps } from './vertical-resizable-split-view.types';
import { validateResizableSplitViewProps } from './vertical-resizable-split-view.utils';

export const VerticalResizableSplitView: FunctionComponent<VerticalResizableSplitViewProps> = (props) => {
  const styles = useStyles();

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

  // Shared values for animation
  const containerHeight = useSharedValue(0);
  const topSectionHeight = useSharedValue(0);
  const minHeight = useSharedValue(0);
  const maxHeight = useSharedValue(0);
  const startY = useSharedValue(0);
  const isDragging = useSharedValue(false);
  const isLayoutReady = useSharedValue(false);

  // Handle container layout measurement
  const handleLayout = useCallback(
    (event: LayoutChangeEvent) => {
      const { height } = event.nativeEvent.layout;
      if (height > 0 && !isLayoutReady.value) {
        containerHeight.value = height;
        minHeight.value = height * minTopRatio;
        maxHeight.value = height * maxTopRatio;
        topSectionHeight.value = height * initialTopRatio;
        isLayoutReady.value = true;
      }
    },
    [minTopRatio, maxTopRatio, initialTopRatio, containerHeight, minHeight, maxHeight, topSectionHeight, isLayoutReady]
  );

  const panGesture = Gesture.Pan()
    .onStart(() => {
      startY.value = topSectionHeight.value;
      isDragging.value = true;
    })
    .onUpdate((event) => {
      const newHeight = startY.value + event.translationY;
      topSectionHeight.value = Math.max(minHeight.value, Math.min(newHeight, maxHeight.value));
    })
    .onFinalize(() => {
      isDragging.value = false;
    });

  const topSectionAnimatedStyle = useAnimatedStyle(() => ({ height: topSectionHeight.value }));

  const bottomSectionAnimatedStyle = useAnimatedStyle(() => ({
    height: containerHeight.value - topSectionHeight.value,
  }));

  const dragHandleContainerAnimatedStyle = useAnimatedStyle(() => ({
    top: topSectionHeight.value - RESIZE_HANDLE.dragTargetCrossAxis / 2,
  }));

  const dragHandleAnimatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: withSpring(isDragging.value ? 1.2 : 1, RESIZE_HANDLE.dragSpringConfig) }],
  }));

  return (
    <View style={styles.container} onLayout={handleLayout}>
      <Animated.View style={[styles.topSection, topSectionAnimatedStyle]}>
        {shouldObscureTopPaneContentWhileResizing ? (
          <ResizablePaneDragChrome isDragging={isDragging} isLayoutReady={isLayoutReady} greyLevel="primary">
            {topContent}
          </ResizablePaneDragChrome>
        ) : (
          <>{topContent}</>
        )}
      </Animated.View>

      <Animated.View style={[styles.bottomSection, bottomSectionAnimatedStyle]}>
        {shouldObscureBottomPaneContentWhileResizing ? (
          <ResizablePaneDragChrome isDragging={isDragging} isLayoutReady={isLayoutReady} greyLevel="secondary">
            {bottomContent}
          </ResizablePaneDragChrome>
        ) : (
          <>{bottomContent}</>
        )}
      </Animated.View>

      {!hideHandle && (
        <GestureDetector gesture={panGesture}>
          <Animated.View style={[styles.handleContainer, handleContainerStyle, dragHandleContainerAnimatedStyle]}>
            <Animated.View style={[styles.handle, handleStyle, dragHandleAnimatedStyle]} />
          </Animated.View>
        </GestureDetector>
      )}
    </View>
  );
};

const useStyles = () => {
  const theme = useAppTheme();

  return StyleSheet.create({
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
    handle: {
      width: RESIZE_HANDLE.length,
      height: theme.spacing(RESIZE_HANDLE.thicknessSpacing),
      backgroundColor: theme.colors.primary,
      borderRadius: theme.roundness,
      borderWidth: StyleSheet.hairlineWidth,
      borderColor: theme.colors.outline,
    },
  });
};
