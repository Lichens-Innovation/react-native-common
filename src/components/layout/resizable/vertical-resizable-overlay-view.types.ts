import { ReactNode } from 'react';
import { ViewStyle } from 'react-native';

export interface VerticalResizableOverlayViewProps {
  /** Content to display in the overlay section (foreground, on top) */
  foregroundContent: ReactNode;
  /** Content to display in the background section (fills the entire container) */
  backgroundContent: ReactNode;
  /** Initial height ratio for the foreground overlay (0 to 1). Default: 0.5 */
  initialForegroundRatio?: number;
  /** Minimum height ratio for the foreground overlay (0 to 1). Default: 0.15 */
  minForegroundRatio?: number;
  /** Maximum height ratio for the foreground overlay (0 to 1). Default: 0.85 */
  maxForegroundRatio?: number;
  /** Aspect ratio (width/height) for the foreground content. If provided, width will be calculated based on height */
  foregroundContentAspectRatio?: number;
  /** Style for the drag handle container */
  handleContainerStyle?: ViewStyle;
  /** Style for the drag handle bar */
  handleStyle?: ViewStyle;
  /** Whether to hide the drag handle. Default: false */
  hideHandle?: boolean;
}
