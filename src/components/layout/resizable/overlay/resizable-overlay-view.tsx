import { useEffect, type FunctionComponent } from 'react';
import { LayoutChangeEvent, StyleSheet, View, ViewStyle } from 'react-native';
import { Gesture, GestureDetector } from 'react-native-gesture-handler';
import Animated, { useAnimatedStyle, useSharedValue, withSpring } from 'react-native-reanimated';
import { useAppTheme } from '../../../../theme';
import { isDevelopment } from '../../../../utils';
import { ResizablePaneDragChrome } from '../resizable-pane-drag-chrome';
import { RESIZE_HANDLE } from '../resizable-view.constants';
import { ResizableOverlayViewProps } from './resizable-overlay-view.types';
import { computeResizableOverlayLayoutValues, validateResizableOverlayProps } from './resizable-overlay-view.utils';

const OVERLAY_ANCHOR_STYLES: Record<NonNullable<ResizableOverlayViewProps['anchorType']>, ViewStyle> = {
  topLeft: { top: 0, left: 0 },
  topRight: { top: 0, right: 0 },
  bottomLeft: { bottom: 0, left: 0 },
  bottomRight: { bottom: 0, right: 0 },
};

export const ResizableOverlayView: FunctionComponent<ResizableOverlayViewProps> = (props) => {
  const styles = useStyles();

  useEffect(() => {
    if (isDevelopment()) validateResizableOverlayProps(props);
  }, [props]);

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
    shouldObscureForegroundPaneContentWhileResizing = false,
    shouldObscureBackgroundPaneContentWhileResizing = false,
  } = props;

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
  const isLayoutReady = useSharedValue(false);

  // Handle container layout measurement
  const handleLayout = (event: LayoutChangeEvent) => {
    const computedValues = computeResizableOverlayLayoutValues({
      event,
      initialForegroundRatio,
      minForegroundRatio,
      maxForegroundRatio,
      foregroundContentAspectRatio,
    });

    containerHeight.value = computedValues.containerHeight;
    containerWidth.value = computedValues.containerWidth;
    minHeight.value = computedValues.minHeight;
    maxHeight.value = computedValues.maxHeight;
    overlayHeight.value = computedValues.overlayHeight;
    isLayoutReady.value = true;
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
    .onFinalize(() => {
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
      ? containerHeight.value - effectiveHeight - RESIZE_HANDLE.dragTargetCrossAxis / 2
      : effectiveHeight - RESIZE_HANDLE.dragTargetCrossAxis / 2;

    return {
      top,
      width: effectiveWidth,
      left,
    };
  }, [foregroundContentAspectRatio, isBottomAnchored, isLeftAnchored]);

  const dragHandleAnimatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: withSpring(isDragging.value ? 1.2 : 1, RESIZE_HANDLE.dragSpringConfig) }],
  }));

  return (
    <View style={styles.container} onLayout={handleLayout}>
      {/* Background content - fills entire container */}
      <View style={styles.backgroundSection}>
        {shouldObscureBackgroundPaneContentWhileResizing ? (
          <ResizablePaneDragChrome isDragging={isDragging} isLayoutReady={isLayoutReady} greyLevel="primary">
            {backgroundContent}
          </ResizablePaneDragChrome>
        ) : (
          <>{backgroundContent}</>
        )}
      </View>

      {/* Foreground content - positioned absolutely on top */}
      <Animated.View style={[styles.overlaySection, overlayAnchorStyle, overlayAnimatedStyle]}>
        {shouldObscureForegroundPaneContentWhileResizing ? (
          <ResizablePaneDragChrome isDragging={isDragging} isLayoutReady={isLayoutReady} greyLevel="secondary">
            {foregroundContent}
          </ResizablePaneDragChrome>
        ) : (
          <>{foregroundContent}</>
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
    backgroundSection: {
      flex: 1,
    },
    overlaySection: {
      position: 'absolute',
      overflow: 'hidden',
    },
    handleContainer: {
      position: 'absolute',
      height: RESIZE_HANDLE.dragTargetCrossAxis,
      alignItems: 'center',
      justifyContent: 'center',
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
