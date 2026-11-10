import { assertRatioBoundsOrdering, assertRatioInUnitRange } from '../resizable-view.utils';
import { HorizontalResizableSplitViewProps } from './horizontal-resizable-split-view.types';

export const validateResizableSplitViewProps = ({
  initialLeftRatio,
  minLeftRatio,
  maxLeftRatio,
}: HorizontalResizableSplitViewProps) => {
  const initial = { name: 'initialLeftRatio', value: initialLeftRatio };
  const min = { name: 'minLeftRatio', value: minLeftRatio };
  const max = { name: 'maxLeftRatio', value: maxLeftRatio };

  assertRatioInUnitRange(initial);
  assertRatioInUnitRange(min);
  assertRatioInUnitRange(max);
  assertRatioBoundsOrdering({ initial, min, max });
};
