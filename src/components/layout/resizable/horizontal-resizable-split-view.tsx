import { useCallback, useState, type FunctionComponent } from 'react';
import { LayoutChangeEvent, StyleSheet, View } from 'react-native';
import { Gesture, GestureDetector } from 'react-native-gesture-handler';
import Animated, { useAnimatedStyle, useSharedValue, withSpring } from 'react-native-reanimated';
import { isDevelopment } from '../../../utils';
import { HorizontalResizableSplitViewProps } from './horizontal-resizable-split-view.types';
import { validateResizableSplitViewProps } from './horizontal-resizable-split-view.utils';

const DRAG_HANDLE_WIDTH = 20;
const DEFAULT_ANIMATION_CONFIG = { damping: 25, stiffness: 300, mass: 0.8 };

export const HorizontalResizableSplitView: FunctionComponent<HorizontalResizableSplitViewProps> = (props) => {
  if (isDevelopment()) validateResizableSplitViewProps(props);

  const {
    leftContent,
    rightContent,
    initialLeftRatio = 0.5,
    minLeftRatio = 0.15,
    maxLeftRatio = 0.85,
    handleContainerStyle,
    handleStyle,
    hideHandle = false,
  } = props;

  // Track measured container width
  const [isReady, setIsReady] = useState(false);

  // Shared values for animation
  const leftSectionWidth = useSharedValue(0);
  const minWidth = useSharedValue(0);
  const maxWidth = useSharedValue(0);
  const startX = useSharedValue(0);
  const isDragging = useSharedValue(false);

  // Handle container layout measurement
  const handleLayout = useCallback(
    (event: LayoutChangeEvent) => {
      const { width } = event.nativeEvent.layout;
      if (width > 0 && !isReady) {
        minWidth.value = width * minLeftRatio;
        maxWidth.value = width * maxLeftRatio;
        leftSectionWidth.value = width * initialLeftRatio;
        setIsReady(true);
      }
    },
    [minLeftRatio, maxLeftRatio, initialLeftRatio, minWidth, maxWidth, leftSectionWidth, isReady]
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
    .onEnd(() => {
      isDragging.value = false;
    });

  const leftSectionAnimatedStyle = useAnimatedStyle(() => ({ width: leftSectionWidth.value }));

  const dragHandleContainerAnimatedStyle = useAnimatedStyle(() => ({
    left: leftSectionWidth.value - DRAG_HANDLE_WIDTH / 2,
  }));

  const dragHandleAnimatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: withSpring(isDragging.value ? 1.2 : 1, DEFAULT_ANIMATION_CONFIG) }],
  }));

  return (
    <View style={[styles.container]} onLayout={handleLayout}>
      <Animated.View style={[styles.leftSection, leftSectionAnimatedStyle]}>{leftContent}</Animated.View>

      {!hideHandle && (
        <GestureDetector gesture={panGesture}>
          <Animated.View style={[styles.handleContainer, handleContainerStyle, dragHandleContainerAnimatedStyle]}>
            <Animated.View style={[styles.handle, handleStyle, dragHandleAnimatedStyle]} />
          </Animated.View>
        </GestureDetector>
      )}

      <View style={[styles.rightSection]}>{rightContent}</View>
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
    flex: 1,
    overflow: 'hidden',
  },
  handleContainer: {
    position: 'absolute',
    top: 0,
    bottom: 0,
    width: DRAG_HANDLE_WIDTH,
    alignItems: 'center',
    justifyContent: 'center',
  },
  handle: {
    width: 4,
    height: 40,
    backgroundColor: '#888888',
    borderRadius: 2,
  },
});
