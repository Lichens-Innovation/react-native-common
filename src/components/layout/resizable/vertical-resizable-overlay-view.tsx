import { useCallback, useState, type FunctionComponent } from 'react';
import { LayoutChangeEvent, StyleSheet, View } from 'react-native';
import { Gesture, GestureDetector } from 'react-native-gesture-handler';
import Animated, { useAnimatedStyle, useSharedValue, withSpring } from 'react-native-reanimated';
import { isDevelopment } from '../../../utils';
import { VerticalResizableOverlayViewProps } from './vertical-resizable-overlay-view.types';
import { validateResizableOverlayProps } from './vertical-resizable-overlay-view.utils';

const DRAG_HANDLE_HEIGHT = 20;
const DEFAULT_ANIMATION_CONFIG = { damping: 25, stiffness: 300, mass: 0.8 };

export const VerticalResizableOverlayView: FunctionComponent<VerticalResizableOverlayViewProps> = (props) => {
  if (isDevelopment()) validateResizableOverlayProps(props);

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
  } = props;

  // Track measured container height
  const [isReady, setIsReady] = useState(false);

  // Shared values for animation
  const overlayHeight = useSharedValue(0);
  const containerWidth = useSharedValue(0);
  const minHeight = useSharedValue(0);
  const maxHeight = useSharedValue(0);
  const startY = useSharedValue(0);
  const isDragging = useSharedValue(false);

  // Handle container layout measurement
  const handleLayout = useCallback(
    (event: LayoutChangeEvent) => {
      const { height, width } = event.nativeEvent.layout;
      if (height > 0 && !isReady) {
        minHeight.value = height * minForegroundRatio;
        maxHeight.value = height * maxForegroundRatio;
        overlayHeight.value = height * initialForegroundRatio;
        containerWidth.value = width;
        setIsReady(true);
      }
    },
    [
      minForegroundRatio,
      maxForegroundRatio,
      initialForegroundRatio,
      minHeight,
      maxHeight,
      overlayHeight,
      containerWidth,
      isReady,
    ]
  );

  const panGesture = Gesture.Pan()
    .onStart(() => {
      startY.value = overlayHeight.value;
      isDragging.value = true;
    })
    .onUpdate((event) => {
      const newHeight = startY.value + event.translationY;
      overlayHeight.value = Math.max(minHeight.value, Math.min(newHeight, maxHeight.value));
    })
    .onEnd(() => {
      isDragging.value = false;
    });

  const overlayAnimatedStyle = useAnimatedStyle(() => {
    let height = overlayHeight.value;
    let width: number | undefined;

    if (foregroundContentAspectRatio !== undefined) {
      const calculatedWidth = height * foregroundContentAspectRatio;
      if (calculatedWidth > containerWidth.value) {
        // Width exceeds container, recalculate height to maintain aspect ratio
        width = containerWidth.value;
        height = Math.max(containerWidth.value / foregroundContentAspectRatio, minHeight.value);
      } else {
        width = calculatedWidth;
      }
    }

    return width !== undefined ? { height, width } : { height };
  });

  const dragHandleContainerAnimatedStyle = useAnimatedStyle(() => {
    let effectiveHeight = overlayHeight.value;
    let effectiveWidth = containerWidth.value;

    if (foregroundContentAspectRatio !== undefined) {
      const calculatedWidth = effectiveHeight * foregroundContentAspectRatio;
      if (calculatedWidth > containerWidth.value) {
        effectiveHeight = Math.max(containerWidth.value / foregroundContentAspectRatio, minHeight.value);
        effectiveWidth = containerWidth.value;
      } else {
        effectiveWidth = calculatedWidth;
      }
    }

    return {
      top: effectiveHeight - DRAG_HANDLE_HEIGHT / 2,
      right: 0,
      width: effectiveWidth,
    };
  });

  const dragHandleAnimatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: withSpring(isDragging.value ? 1.2 : 1, DEFAULT_ANIMATION_CONFIG) }],
  }));

  return (
    <View style={[styles.container]} onLayout={handleLayout}>
      {/* Background content - fills entire container */}
      <View style={styles.backgroundSection}>{backgroundContent}</View>

      {/* Foreground content - positioned absolutely on top */}
      <Animated.View style={[styles.overlaySection, overlayAnimatedStyle]}>{foregroundContent}</Animated.View>

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

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  backgroundSection: {
    flex: 1,
  },
  overlaySection: {
    position: 'absolute',
    top: 0,
    right: 0,
    overflow: 'hidden',
  },
  handleContainer: {
    position: 'absolute',
    height: DRAG_HANDLE_HEIGHT,
    alignItems: 'center',
    justifyContent: 'center',
  },
  handle: {
    width: 40,
    height: 4,
    backgroundColor: '#888888',
    borderRadius: 4,
  },
});
