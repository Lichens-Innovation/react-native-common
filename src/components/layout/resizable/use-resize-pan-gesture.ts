import { Gesture } from 'react-native-gesture-handler';
import { type SharedValue, useSharedValue } from 'react-native-reanimated';

type ResizeDragAxis = 'x' | 'y';

export interface UseResizePanGestureArgs {
  size: SharedValue<number>;
  minSize: SharedValue<number>;
  maxSize: SharedValue<number>;
  axis: ResizeDragAxis;
  sizeChangePerDragUnit?: 1 | -1;
}

export const useResizePanGesture = ({
  size,
  minSize,
  maxSize,
  axis,
  sizeChangePerDragUnit = 1,
}: UseResizePanGestureArgs) => {
  const startSize = useSharedValue(0);
  const isDragging = useSharedValue(false);

  const panGesture = Gesture.Pan()
    .onStart(() => {
      'worklet';
      startSize.set(size.value);
      isDragging.set(true);
    })
    .onUpdate((event) => {
      'worklet';
      const translation = axis === 'x' ? event.translationX : event.translationY;
      const newSize = startSize.value + sizeChangePerDragUnit * translation;
      size.set(Math.max(minSize.value, Math.min(newSize, maxSize.value)));
    })
    .onFinalize(() => {
      'worklet';
      isDragging.set(false);
    });

  return { panGesture, isDragging };
};
