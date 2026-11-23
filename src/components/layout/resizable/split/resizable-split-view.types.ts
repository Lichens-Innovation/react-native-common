import { type ReactNode } from 'react';
import { type StyleProp, type ViewStyle } from 'react-native';

export type ResizableSplitAxis = 'x' | 'y';

export interface ResizableSplitViewProps {
  axis: ResizableSplitAxis;
  firstContent: ReactNode;
  secondContent: ReactNode;
  initialRatio: number;
  minRatio: number;
  maxRatio: number;
  handleContainerStyle?: StyleProp<ViewStyle>;
  handleStyle?: StyleProp<ViewStyle>;
  hideHandle: boolean;
  shouldObscureFirstPaneContentWhileResizing: boolean;
  shouldObscureSecondPaneContentWhileResizing: boolean;
}
