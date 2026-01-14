import { useState, type FunctionComponent } from 'react';
import { LayoutChangeEvent, StyleSheet, View, ViewStyle } from 'react-native';
import { Gesture, GestureDetector } from 'react-native-gesture-handler';
import Animated, { useAnimatedStyle, useSharedValue, withSpring } from 'react-native-reanimated';
import { isDevelopment } from '../../../utils';
import { VerticalResizableOverlayViewProps } from './vertical-resizable-overlay-view.types';
import { validateResizableOverlayProps } from './vertical-resizable-overlay-view.utils';

const DRAG_HANDLE_HEIGHT = 20;
const DEFAULT_ANIMATION_CONFIG = { damping: 25, stiffness: 300, mass: 0.8 };

const OVERLAY_ANCHOR_STYLES: Record<NonNullable<VerticalResizableOverlayViewProps['anchorType']>, ViewStyle> = {
  topLeft: { top: 0, left: 0 },
  topRight: { top: 0, right: 0 },
  bottomLeft: { bottom: 0, left: 0 },
  bottomRight: { bottom: 0, right: 0 },
};

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
    anchorType = 'topRight',
  } = props;

  // Track measured container height
  const [isReady, setIsReady] = useState(false);

  // Anchor styles
  const overlayAnchorStyle = OVERLAY_ANCHOR_STYLES[anchorType];
  const isBottomAnchored = ['bottomLeft', 'bottomRight'].includes(anchorType);
  const isLeftAnchored = ['topLeft', 'bottomLeft'].includes(anchorType);

  // Shared values for animation
  const overlayHeight = useSharedValue(0);
  const containerHeight = useSharedValue(0);
  const containerWidth = useSharedValue(0);
  const minHeight = useSharedValue(0);
  const maxHeight = useSharedValue(0);
  const startY = useSharedValue(0);
  const isDragging = useSharedValue(false);

  // Handle container layout measurement
  const handleLayout = (event: LayoutChangeEvent) => {
    const { height, width } = event.nativeEvent.layout;
    if (height <= 0) return;

    // Always keep container & bounds updated (layout can change over time).
    const computedMinHeight = height * minForegroundRatio;
    const computedMaxHeightFromContainer = height * maxForegroundRatio;
    const computedMaxHeightFromAspectRatio =
      foregroundContentAspectRatio !== undefined ? width / foregroundContentAspectRatio : Number.POSITIVE_INFINITY;
    const computedMaxHeight = Math.min(computedMaxHeightFromContainer, computedMaxHeightFromAspectRatio);

    containerHeight.value = height;
    containerWidth.value = width;
    minHeight.value = computedMinHeight;
    maxHeight.value = computedMaxHeight;

    if (!isReady) {
      overlayHeight.value = Math.max(computedMinHeight, Math.min(height * initialForegroundRatio, computedMaxHeight));
      setIsReady(true);
    } else {
      // Clamp current height to updated bounds.
      overlayHeight.value = Math.max(computedMinHeight, Math.min(overlayHeight.value, computedMaxHeight));
    }
  };

  const panGesture = Gesture.Pan()
    .onStart(() => {
      startY.value = overlayHeight.value;
      isDragging.value = true;
    })
    .onUpdate((event) => {
      // If the overlay is anchored to the bottom, dragging up should INCREASE its height.
      const direction = isBottomAnchored ? -1 : 1;
      const newHeight = startY.value + direction * event.translationY;
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

    // Always compute an explicit `left` to avoid stale left/right values when `anchorType` changes.
    const left = isLeftAnchored ? 0 : Math.max(0, containerWidth.value - effectiveWidth);
    // If anchored at bottom, the handle must attach to the TOP edge of the overlay.
    // Otherwise (top anchor), it attaches to the BOTTOM edge.
    const top = isBottomAnchored
      ? containerHeight.value - effectiveHeight - DRAG_HANDLE_HEIGHT / 2
      : effectiveHeight - DRAG_HANDLE_HEIGHT / 2;

    return {
      top,
      width: effectiveWidth,
      left,
    };
  }, [foregroundContentAspectRatio, isBottomAnchored, isLeftAnchored]);

  const dragHandleAnimatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: withSpring(isDragging.value ? 1.2 : 1, DEFAULT_ANIMATION_CONFIG) }],
  }));

  return (
    <View style={[styles.container]} onLayout={handleLayout}>
      {/* Background content - fills entire container */}
      <View style={styles.backgroundSection}>{backgroundContent}</View>

      {/* Foreground content - positioned absolutely on top */}
      <Animated.View style={[styles.overlaySection, overlayAnchorStyle, overlayAnimatedStyle]}>
        {foregroundContent}
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

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  backgroundSection: {
    flex: 1,
  },
  overlaySection: {
    position: 'absolute',
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
