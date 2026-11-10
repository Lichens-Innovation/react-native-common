import { ReactNode } from 'react';
import { StyleProp, ViewStyle } from 'react-native';

export interface VerticalResizableSplitViewProps {
  topContent: ReactNode;
  bottomContent: ReactNode;
  /** Initial proportion for the top section (0 to 1). Default: 0.5 habit-hooks-disable non-essential-comment */
  initialTopRatio?: number;
  /** Minimum proportion for the top section (0 to 1). Default: 0.15 habit-hooks-disable non-essential-comment */
  minTopRatio?: number;
  /** Maximum proportion for the top section (0 to 1). Default: 0.85 habit-hooks-disable non-essential-comment */
  maxTopRatio?: number;
  handleContainerStyle?: StyleProp<ViewStyle>;
  handleStyle?: StyleProp<ViewStyle>;
  /** Whether to hide the drag handle. Default: false habit-hooks-disable non-essential-comment */
  hideHandle?: boolean;

  /** When true, obscures the top pane content while resizing or before layout is ready. Default: false habit-hooks-disable non-essential-comment */
  shouldObscureTopPaneContentWhileResizing?: boolean;
  /** When true, obscures the bottom pane content while resizing or before layout is ready. Default: false habit-hooks-disable non-essential-comment */
  shouldObscureBottomPaneContentWhileResizing?: boolean;
}
