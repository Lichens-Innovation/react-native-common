import { ReactNode } from 'react';
import { ViewStyle } from 'react-native';

export interface HorizontalResizableSplitViewProps {
  /** Content to display in the left section */
  leftContent: ReactNode;
  /** Content to display in the right section */
  rightContent: ReactNode;
  /** Initial proportion for the left section (0 to 1). Default: 0.5 */
  initialLeftRatio?: number;
  /** Minimum proportion for the left section (0 to 1). Default: 0.15 */
  minLeftRatio?: number;
  /** Maximum proportion for the left section (0 to 1). Default: 0.85 */
  maxLeftRatio?: number;
  /** Style for the drag handle container */
  handleContainerStyle?: ViewStyle;
  /** Style for the drag handle bar */
  handleStyle?: ViewStyle;
  /** Whether to hide the drag handle. Default: false */
  hideHandle?: boolean;
}
