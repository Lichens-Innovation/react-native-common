import { ReactNode } from 'react';
import { StyleProp, ViewStyle } from 'react-native';

export interface HorizontalResizableSplitViewProps {
  leftContent: ReactNode;
  rightContent: ReactNode;
  /** Initial proportion for the left section (0 to 1). Default: 0.5 habit-hooks-disable non-essential-comment */
  initialLeftRatio?: number;
  /** Minimum proportion for the left section (0 to 1). Default: 0.15 habit-hooks-disable non-essential-comment */
  minLeftRatio?: number;
  /** Maximum proportion for the left section (0 to 1). Default: 0.85 habit-hooks-disable non-essential-comment */
  maxLeftRatio?: number;
  handleContainerStyle?: StyleProp<ViewStyle>;
  handleStyle?: StyleProp<ViewStyle>;
  /** Whether to hide the drag handle. Default: false habit-hooks-disable non-essential-comment */
  hideHandle?: boolean;

  /** When true, obscures the left pane content while resizing or before layout is ready. Default: false habit-hooks-disable non-essential-comment */
  shouldObscureLeftPaneContentWhileResizing?: boolean;
  /** When true, obscures the right pane content while resizing or before layout is ready. Default: false habit-hooks-disable non-essential-comment */
  shouldObscureRightPaneContentWhileResizing?: boolean;
}
