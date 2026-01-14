// NOTE: isNullish import removed - cannot use external functions in Reanimated worklets
// import { isNullish } from '@lichens-innovation/ts-common';
import { ReactNode, useCallback, useEffect, useState, type FunctionComponent } from 'react';
import { LayoutChangeEvent, StyleSheet, View, ViewStyle } from 'react-native';
import { Gesture, GestureDetector } from 'react-native-gesture-handler';
import Animated, { runOnJS, useAnimatedStyle, useSharedValue, withSpring } from 'react-native-reanimated';

const DRAG_HANDLE_HEIGHT = 20;
const DEFAULT_ANIMATION_CONFIG = { damping: 25, stiffness: 300, mass: 0.8 };

// Logging utility for debugging
const LOG_PREFIX = '[VerticalResizableOverlayView]';
const log = (message: string, data?: unknown) => {
  if (data !== undefined) {
    console.log(`${LOG_PREFIX} ${message}`, data);
  } else {
    console.log(`${LOG_PREFIX} ${message}`);
  }
};

// Safe isNullish check that works in worklets (inline implementation)
const isNullishWorklet = (value: unknown): value is null | undefined => {
  'worklet';
  return value === null || value === undefined;
};

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
  log('Component rendering', {
    initialTopRatio,
    minTopRatio,
    maxTopRatio,
    topContentAspectRatio,
    hideHandle,
  });

  // Track measured container height
  const [isReady, setIsReady] = useState(false);

  // Shared values for animation
  const overlayHeight = useSharedValue(0);
  const containerWidth = useSharedValue(0);
  const minHeight = useSharedValue(0);
  const maxHeight = useSharedValue(0);
  const startY = useSharedValue(0);
  const isDragging = useSharedValue(false);

  useEffect(() => {
    log('Component mounted');
    return () => {
      log('Component unmounting');
    };
  }, []);

  // Handle container layout measurement
  const handleLayout = useCallback(
    (event: LayoutChangeEvent) => {
      try {
        const { height, width } = event.nativeEvent.layout;
        log('handleLayout called', { height, width, isReady });

        if (height > 0 && !isReady) {
          const calculatedMinHeight = height * minTopRatio;
          const calculatedMaxHeight = height * maxTopRatio;
          const calculatedInitialHeight = height * initialTopRatio;

          log('Setting initial values', {
            calculatedMinHeight,
            calculatedMaxHeight,
            calculatedInitialHeight,
            width,
          });

          minHeight.value = calculatedMinHeight;
          maxHeight.value = calculatedMaxHeight;
          overlayHeight.value = calculatedInitialHeight;
          containerWidth.value = width;
          setIsReady(true);
          log('isReady set to true');
        }
      } catch (error) {
        log('ERROR in handleLayout', error);
      }
    },
    [minTopRatio, maxTopRatio, initialTopRatio, minHeight, maxHeight, overlayHeight, containerWidth, isReady]
  );

  // Helper to log from worklet thread
  const logFromWorklet = (message: string, data?: unknown) => {
    'worklet';
    runOnJS(log)(message, data);
  };

  const panGesture = Gesture.Pan()
    .onStart(() => {
      'worklet';
      logFromWorklet('Pan gesture started', { overlayHeightValue: overlayHeight.value });
      startY.value = overlayHeight.value;
      isDragging.value = true;
    })
    .onUpdate((event) => {
      'worklet';
      const newHeight = startY.value + event.translationY;
      overlayHeight.value = Math.max(minHeight.value, Math.min(newHeight, maxHeight.value));
    })
    .onEnd(() => {
      'worklet';
      logFromWorklet('Pan gesture ended', { finalHeight: overlayHeight.value });
      isDragging.value = false;
    });

  const overlayAnimatedStyle = useAnimatedStyle(() => {
    'worklet';
    try {
      let height = overlayHeight.value;
      let width: number | undefined;

      // NOTE: Using inline nullish check instead of isNullish() to avoid worklet compatibility issues
      if (!isNullishWorklet(topContentAspectRatio) && topContentAspectRatio !== 0) {
        const calculatedWidth = height * topContentAspectRatio;
        if (calculatedWidth > containerWidth.value) {
          // Width exceeds container, recalculate height to maintain aspect ratio
          width = containerWidth.value;
          height = containerWidth.value / topContentAspectRatio;
        } else {
          width = calculatedWidth;
        }
      }

      const result = !isNullishWorklet(width) ? { height, width } : { height };
      return result;
    } catch (error) {
      logFromWorklet('ERROR in overlayAnimatedStyle', String(error));
      return { height: 100 }; // Fallback
    }
  });

  const dragHandleContainerAnimatedStyle = useAnimatedStyle(() => {
    'worklet';
    try {
      let effectiveHeight = overlayHeight.value;
      let effectiveWidth = containerWidth.value;

      // NOTE: Using inline nullish check instead of isNullish() to avoid worklet compatibility issues
      if (!isNullishWorklet(topContentAspectRatio) && topContentAspectRatio !== 0) {
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
    } catch (error) {
      logFromWorklet('ERROR in dragHandleContainerAnimatedStyle', String(error));
      return { top: 100, right: 0, width: 100 }; // Fallback
    }
  });

  const dragHandleAnimatedStyle = useAnimatedStyle(() => {
    'worklet';
    try {
      return {
        transform: [{ scale: withSpring(isDragging.value ? 1.2 : 1, DEFAULT_ANIMATION_CONFIG) }],
      };
    } catch (error) {
      logFromWorklet('ERROR in dragHandleAnimatedStyle', String(error));
      return { transform: [{ scale: 1 }] }; // Fallback
    }
  });

  log('About to render', { isReady, hideHandle });

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
