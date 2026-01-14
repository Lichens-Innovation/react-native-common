import { useCallback, useState, type FunctionComponent } from 'react';
import { LayoutChangeEvent, StyleSheet, View } from 'react-native';
import { Gesture, GestureDetector } from 'react-native-gesture-handler';
import Animated, { useAnimatedStyle, useSharedValue, withSpring } from 'react-native-reanimated';
import { isDevelopment } from '../../../utils';
import { VerticalResizableSplitViewProps } from './vertical-resizable-split-view.types';
import { validateResizableSplitViewProps } from './vertical-resizable-split-view.utils';

const DRAG_HANDLE_HEIGHT = 20;
const DEFAULT_ANIMATION_CONFIG = { damping: 25, stiffness: 300, mass: 0.8 };

export const VerticalResizableSplitView: FunctionComponent<VerticalResizableSplitViewProps> = (props) => {
  if (isDevelopment()) validateResizableSplitViewProps(props);

  const {
    topContent,
    bottomContent,
    initialTopRatio = 0.5,
    minTopRatio = 0.15,
    maxTopRatio = 0.85,
    handleContainerStyle,
    handleStyle,
    hideHandle = false,
  } = props;

  // Track measured container height
  const [isReady, setIsReady] = useState(false);

  // Shared values for animation
  const topSectionHeight = useSharedValue(0);
  const minHeight = useSharedValue(0);
  const maxHeight = useSharedValue(0);
  const startY = useSharedValue(0);
  const isDragging = useSharedValue(false);

  // Handle container layout measurement
  const handleLayout = useCallback(
    (event: LayoutChangeEvent) => {
      const { height } = event.nativeEvent.layout;
      if (height > 0 && !isReady) {
        minHeight.value = height * minTopRatio;
        maxHeight.value = height * maxTopRatio;
        topSectionHeight.value = height * initialTopRatio;
        setIsReady(true);
      }
    },
    [minTopRatio, maxTopRatio, initialTopRatio, minHeight, maxHeight, topSectionHeight, isReady]
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
    .onEnd(() => {
      isDragging.value = false;
    });

  const topSectionAnimatedStyle = useAnimatedStyle(() => ({ height: topSectionHeight.value }));

  const dragHandleContainerAnimatedStyle = useAnimatedStyle(() => ({
    top: topSectionHeight.value - DRAG_HANDLE_HEIGHT / 2,
  }));

  const dragHandleAnimatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: withSpring(isDragging.value ? 1.2 : 1, DEFAULT_ANIMATION_CONFIG) }],
  }));

  return (
    <View style={[styles.container]} onLayout={handleLayout}>
      <Animated.View style={[styles.topSection, topSectionAnimatedStyle]}>{topContent}</Animated.View>

      {!hideHandle && (
        <GestureDetector gesture={panGesture}>
          <Animated.View style={[styles.handleContainer, handleContainerStyle, dragHandleContainerAnimatedStyle]}>
            <Animated.View style={[styles.handle, handleStyle, dragHandleAnimatedStyle]} />
          </Animated.View>
        </GestureDetector>
      )}

      <View style={[styles.bottomSection]}>{bottomContent}</View>
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
    flex: 1,
    overflow: 'hidden',
  },
  handleContainer: {
    position: 'absolute',
    left: 0,
    right: 0,
    height: DRAG_HANDLE_HEIGHT,
    alignItems: 'center',
    justifyContent: 'center',
  },
  handle: {
    width: 40,
    height: 4,
    backgroundColor: '#888888',
    borderRadius: 2,
  },
});
