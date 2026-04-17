import { useCallback, useEffect, type FunctionComponent } from 'react';
import { LayoutChangeEvent, StyleSheet, View } from 'react-native';
import { Gesture, GestureDetector } from 'react-native-gesture-handler';
import Animated, { useAnimatedStyle, useSharedValue, withSpring } from 'react-native-reanimated';
import { useAppTheme } from '../../../../theme';
import { isDevelopment } from '../../../../utils';
import { ResizablePaneDragChrome } from '../resizable-pane-drag-chrome';
import { RESIZE_HANDLE } from '../resizable-view.constants';
import { HorizontalResizableSplitViewProps } from './horizontal-resizable-split-view.types';
import { validateResizableSplitViewProps } from './horizontal-resizable-split-view.utils';

export const HorizontalResizableSplitView: FunctionComponent<HorizontalResizableSplitViewProps> = (props) => {
  const styles = useStyles();

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

  // Shared values for animation
  const containerWidth = useSharedValue(0);
  const leftSectionWidth = useSharedValue(0);
  const minWidth = useSharedValue(0);
  const maxWidth = useSharedValue(0);
  const startX = useSharedValue(0);
  const isDragging = useSharedValue(false);
  const isLayoutReady = useSharedValue(false);

  // Handle container layout measurement
  const handleLayout = useCallback(
    (event: LayoutChangeEvent) => {
      const { width } = event.nativeEvent.layout;
      if (width > 0 && !isLayoutReady.value) {
        containerWidth.value = width;
        minWidth.value = width * minLeftRatio;
        maxWidth.value = width * maxLeftRatio;
        leftSectionWidth.value = width * initialLeftRatio;
        isLayoutReady.value = true;
      }
    },
    [minLeftRatio, maxLeftRatio, initialLeftRatio, containerWidth, minWidth, maxWidth, leftSectionWidth, isLayoutReady]
  );

  const panGesture = Gesture.Pan()
    .onStart(() => {
      startX.value = leftSectionWidth.value;
      isDragging.value = true;
    })
    .onUpdate((event) => {
      const newWidth = startX.value + event.translationX;
      leftSectionWidth.value = Math.max(minWidth.value, Math.min(newWidth, maxWidth.value));
    })
    .onFinalize(() => {
      isDragging.value = false;
    });

  const leftSectionAnimatedStyle = useAnimatedStyle(() => ({ width: leftSectionWidth.value }));

  const rightSectionAnimatedStyle = useAnimatedStyle(() => ({
    width: containerWidth.value - leftSectionWidth.value,
  }));

  const dragHandleContainerAnimatedStyle = useAnimatedStyle(() => ({
    left: leftSectionWidth.value - RESIZE_HANDLE.dragTargetCrossAxis / 2,
  }));

  const dragHandleAnimatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: withSpring(isDragging.value ? 1.2 : 1, RESIZE_HANDLE.dragSpringConfig) }],
  }));

  return (
    <View style={styles.container} onLayout={handleLayout}>
      <Animated.View style={[styles.leftSection, leftSectionAnimatedStyle]}>
        {shouldObscureLeftPaneContentWhileResizing ? (
          <ResizablePaneDragChrome isDragging={isDragging} isLayoutReady={isLayoutReady} greyLevel="primary">
            {leftContent}
          </ResizablePaneDragChrome>
        ) : (
          <>{leftContent}</>
        )}
      </Animated.View>

      <Animated.View style={[styles.rightSection, rightSectionAnimatedStyle]}>
        {shouldObscureRightPaneContentWhileResizing ? (
          <ResizablePaneDragChrome isDragging={isDragging} isLayoutReady={isLayoutReady} greyLevel="secondary">
            {rightContent}
          </ResizablePaneDragChrome>
        ) : (
          <>{rightContent}</>
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
    handle: {
      width: theme.spacing(RESIZE_HANDLE.thicknessSpacing),
      height: RESIZE_HANDLE.length,
      backgroundColor: theme.colors.primary,
      borderRadius: theme.roundness,
      borderWidth: StyleSheet.hairlineWidth,
      borderColor: theme.colors.outline,
    },
  });
};
