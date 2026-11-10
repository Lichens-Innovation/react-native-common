import { assertRatioBoundsOrdering, assertRatioInUnitRange } from '../resizable-view.utils';
import { VerticalResizableSplitViewProps } from './vertical-resizable-split-view.types';

export const validateResizableSplitViewProps = ({
  initialTopRatio,
  minTopRatio,
  maxTopRatio,
}: VerticalResizableSplitViewProps) => {
  const initial = { name: 'initialTopRatio', value: initialTopRatio };
  const min = { name: 'minTopRatio', value: minTopRatio };
  const max = { name: 'maxTopRatio', value: maxTopRatio };

  assertRatioInUnitRange(initial);
  assertRatioInUnitRange(min);
  assertRatioInUnitRange(max);
  assertRatioBoundsOrdering({ initial, min, max });
};
