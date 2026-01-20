import { ReactNode } from 'react';
import { StyleProp, ViewStyle } from 'react-native';

export interface VerticalResizableSplitViewProps {
  /** Content to display in the top section */
  topContent: ReactNode;
  /** Content to display in the bottom section */
  bottomContent: ReactNode;
  /** Initial proportion for the top section (0 to 1). Default: 0.5 */
  initialTopRatio?: number;
  /** Minimum proportion for the top section (0 to 1). Default: 0.15 */
  minTopRatio?: number;
  /** Maximum proportion for the top section (0 to 1). Default: 0.85 */
  maxTopRatio?: number;
  /** Style for the drag handle container */
  handleContainerStyle?: StyleProp<ViewStyle>;
  /** Style for the drag handle bar */
  handleStyle?: StyleProp<ViewStyle>;
  /** Whether to hide the drag handle. Default: false */
  hideHandle?: boolean;
}
