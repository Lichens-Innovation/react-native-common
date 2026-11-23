import { useCallback, type FunctionComponent } from 'react';
import { type LayoutChangeEvent, StyleSheet } from 'react-native';
import { useAnimatedStyle, useSharedValue } from 'react-native-reanimated';
import { ResizablePaneLayout } from '../resizable-pane-layout';
import { RESIZE_HANDLE } from '../resizable-view.constants';
import { type ResizableSplitAxis, type ResizableSplitViewProps } from './resizable-split-view.types';

const AXIS_LAYOUT = {
  x: { dimension: 'width', handleOffset: 'left', barOrientation: 'vertical' },
  y: { dimension: 'height', handleOffset: 'top', barOrientation: 'horizontal' },
} as const satisfies Record<ResizableSplitAxis, object>;

/** habit-hooks-disable non-essential-comment
 * Two panes laid out along `axis`; dragging the handle between them moves space from one to the other.
 */
export const ResizableSplitView: FunctionComponent<ResizableSplitViewProps> = ({
  axis,
  firstContent,
  secondContent,
  initialRatio,
  minRatio,
  maxRatio,
  handleContainerStyle,
  handleStyle,
  hideHandle,
  shouldObscureFirstPaneContentWhileResizing,
  shouldObscureSecondPaneContentWhileResizing,
}) => {
  const { dimension, handleOffset, barOrientation } = AXIS_LAYOUT[axis];
  const axisStyles = AXIS_STYLES[axis];

  const containerSize = useSharedValue(0);
  const firstSectionSize = useSharedValue(0);
  const minSize = useSharedValue(0);
  const maxSize = useSharedValue(0);
  const isLayoutReady = useSharedValue(false);

  const handleLayout = useCallback(
    (event: LayoutChangeEvent) => {
      const size = event.nativeEvent.layout[dimension];
      if (size > 0 && !isLayoutReady.value) {
        containerSize.set(size);
        minSize.set(size * minRatio);
        maxSize.set(size * maxRatio);
        firstSectionSize.set(size * initialRatio);
        isLayoutReady.set(true);
      }
    },
    [dimension, minRatio, maxRatio, initialRatio, containerSize, minSize, maxSize, firstSectionSize, isLayoutReady]
  );

  const firstSectionAnimatedStyle = useAnimatedStyle(() => ({ [dimension]: firstSectionSize.value }));

  const secondSectionAnimatedStyle = useAnimatedStyle(() => ({
    [dimension]: containerSize.value - firstSectionSize.value,
  }));

  const dragHandleContainerAnimatedStyle = useAnimatedStyle(() => ({
    [handleOffset]: firstSectionSize.value - RESIZE_HANDLE.dragTargetCrossAxis / 2,
  }));

  return (
    <ResizablePaneLayout
      style={axisStyles.container}
      onLayout={handleLayout}
      firstPane={{
        content: firstContent,
        style: [styles.section, firstSectionAnimatedStyle],
        shouldObscureWhileResizing: shouldObscureFirstPaneContentWhileResizing,
      }}
      secondPane={{
        content: secondContent,
        style: [styles.section, secondSectionAnimatedStyle],
        shouldObscureWhileResizing: shouldObscureSecondPaneContentWhileResizing,
      }}
      isLayoutReady={isLayoutReady}
      resize={{ size: firstSectionSize, minSize, maxSize, axis }}
      handle={{
        isHidden: hideHandle,
        barOrientation,
        containerStyle: [
          styles.handleContainer,
          axisStyles.handleContainer,
          handleContainerStyle,
          dragHandleContainerAnimatedStyle,
        ],
        handleStyle,
      }}
    />
  );
};

const styles = StyleSheet.create({
  section: {
    overflow: 'hidden',
  },
  handleContainer: {
    position: 'absolute',
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 1,
    elevation: 1,
  },
});

const AXIS_STYLES = {
  x: StyleSheet.create({
    container: { flex: 1, flexDirection: 'row' },
    handleContainer: { top: 0, bottom: 0, width: RESIZE_HANDLE.dragTargetCrossAxis },
  }),
  y: StyleSheet.create({
    container: { flex: 1 },
    handleContainer: { left: 0, right: 0, height: RESIZE_HANDLE.dragTargetCrossAxis },
  }),
} satisfies Record<ResizableSplitAxis, object>;
