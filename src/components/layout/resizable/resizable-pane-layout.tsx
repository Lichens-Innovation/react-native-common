import { type FunctionComponent } from 'react';
import { type LayoutChangeEvent, type StyleProp, View, type ViewStyle } from 'react-native';
import { type SharedValue } from 'react-native-reanimated';
import { type ResizablePane, ResizablePaneSlot } from './resizable-pane-slot';
import { ResizeHandle, type ResizeHandleProps } from './resize-handle';
import { type UseResizePanGestureArgs, useResizePanGesture } from './use-resize-pan-gesture';

interface ResizablePaneHandle extends Omit<ResizeHandleProps, 'gesture' | 'isDragging'> {
  isHidden: boolean;
}

interface ResizablePaneLayoutProps {
  style: StyleProp<ViewStyle>;
  onLayout: (event: LayoutChangeEvent) => void;
  firstPane: ResizablePane;
  secondPane: ResizablePane;
  isLayoutReady: SharedValue<boolean>;
  resize: UseResizePanGestureArgs;
  handle: ResizablePaneHandle;
}

/** habit-hooks-disable non-essential-comment
 * Two panes in one container sharing one drag handle that resizes `resize.size`; the second pane is drawn
 * over the first (side by side in a split, floating on top in an overlay) and the handle over both.
 */
export const ResizablePaneLayout: FunctionComponent<ResizablePaneLayoutProps> = ({
  style,
  onLayout,
  firstPane,
  secondPane,
  isLayoutReady,
  resize,
  handle,
}) => {
  const { isHidden, ...handleProps } = handle;
  const { panGesture, isDragging } = useResizePanGesture(resize);

  return (
    <View style={style} onLayout={onLayout}>
      <ResizablePaneSlot pane={firstPane} greyLevel="primary" isDragging={isDragging} isLayoutReady={isLayoutReady} />
      <ResizablePaneSlot
        pane={secondPane}
        greyLevel="secondary"
        isDragging={isDragging}
        isLayoutReady={isLayoutReady}
      />
      {!isHidden && <ResizeHandle {...handleProps} gesture={panGesture} isDragging={isDragging} />}
    </View>
  );
};
