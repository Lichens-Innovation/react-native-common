import { isNullish } from '@lichens-innovation/ts-common';
import { ReactNode, useCallback, useState, type FunctionComponent } from 'react';
import { LayoutChangeEvent, StyleSheet, View, ViewStyle } from 'react-native';
import { Gesture, GestureDetector } from 'react-native-gesture-handler';
import Animated, { useAnimatedStyle, useSharedValue, withSpring } from 'react-native-reanimated';

const DRAG_HANDLE_HEIGHT = 20;
const DEFAULT_ANIMATION_CONFIG = { damping: 25, stiffness: 300, mass: 0.8 };

interface VerticalResizableOverlayViewProps {
  /** Content to display in the overlay section (on top) */
  topContent: ReactNode;
  /** Content to display in the background section (fills the entire container) */
  bottomContent: ReactNode;
  /** Initial height ratio for the overlay (0 to 1). Default: 0.5 */
  initialTopRatio?: number;
  /** Minimum height ratio for the overlay (0 to 1). Default: 0.15 */
  minTopRatio?: number;
  /** Maximum height ratio for the overlay (0 to 1). Default: 0.85 */
  maxTopRatio?: number;
  /** Aspect ratio (width/height) for the top content. If provided, width will be calculated based on height */
  topContentAspectRatio?: number;
  /** Style for the drag handle container */
  handleContainerStyle?: ViewStyle;
  /** Style for the drag handle bar */
  handleStyle?: ViewStyle;
  /** Whether to hide the drag handle. Default: false */
  hideHandle?: boolean;
}

export const VerticalResizableOverlayView: FunctionComponent<VerticalResizableOverlayViewProps> = ({
  topContent,
  bottomContent,
  initialTopRatio = 0.5,
  minTopRatio = 0.15,
  maxTopRatio = 0.85,
  topContentAspectRatio,
  handleContainerStyle,
  handleStyle,
  hideHandle = false,
}) => {
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
        minHeight.value = height * minTopRatio;
        maxHeight.value = height * maxTopRatio;
        overlayHeight.value = height * initialTopRatio;
        containerWidth.value = width;
        setIsReady(true);
      }
    },
    [minTopRatio, maxTopRatio, initialTopRatio, minHeight, maxHeight, overlayHeight, containerWidth, isReady]
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

    if (!isNullish(topContentAspectRatio)) {
      const calculatedWidth = height * topContentAspectRatio;
      if (calculatedWidth > containerWidth.value) {
        // Width exceeds container, recalculate height to maintain aspect ratio
        width = containerWidth.value;
        height = containerWidth.value / topContentAspectRatio;
      } else {
        width = calculatedWidth;
      }
    }

    return !isNullish(width) ? { height, width } : { height };
  });

  const dragHandleContainerAnimatedStyle = useAnimatedStyle(() => {
    let effectiveHeight = overlayHeight.value;
    let effectiveWidth = containerWidth.value;

    if (topContentAspectRatio !== undefined) {
      const calculatedWidth = effectiveHeight * topContentAspectRatio;
      if (calculatedWidth > containerWidth.value) {
        effectiveHeight = containerWidth.value / topContentAspectRatio;
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
      <View style={styles.backgroundSection}>{bottomContent}</View>

      {/* Overlay content - positioned absolutely on top */}
      <Animated.View style={[styles.overlaySection, overlayAnimatedStyle]}>{topContent}</Animated.View>

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
