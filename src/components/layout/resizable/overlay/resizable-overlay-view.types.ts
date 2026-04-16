import { ReactNode } from 'react';
import { StyleProp, ViewStyle } from 'react-native';

export type ResizableOverlayViewAnchorType = 'topLeft' | 'topRight' | 'bottomLeft' | 'bottomRight';

export interface ResizableOverlayViewProps {
  /** Content to display in the overlay section (foreground, on top) */
  foregroundContent: ReactNode;
  /** Content to display in the background section (fills the entire container) */
  backgroundContent: ReactNode;
  /**
   * Where the overlay is anchored inside the container.
   * Default: topRight
   */
  anchorType?: ResizableOverlayViewAnchorType;
  /** Initial height ratio for the foreground overlay (0 to 1). Default: 0.5 */
  initialForegroundRatio?: number;
  /** Minimum height ratio for the foreground overlay (0 to 1). Default: 0.15 */
  minForegroundRatio?: number;
  /** Maximum height ratio for the foreground overlay (0 to 1). Default: 0.85 */
  maxForegroundRatio?: number;
  /** Aspect ratio (width/height) for the foreground content. If provided, width will be calculated based on height */
  foregroundContentAspectRatio?: number;
  /** Style for the drag handle container */
  handleContainerStyle?: StyleProp<ViewStyle>;
  /** Style for the drag handle bar */
  handleStyle?: StyleProp<ViewStyle>;
  /** Whether to hide the drag handle. Default: false */
  hideHandle?: boolean;

  /** When true, obscures the foreground pane content while resizing or before layout is ready. Default: false */
  shouldObscureForegroundPaneContentWhileResizing?: boolean;
  /** When true, obscures the background pane content while resizing or before layout is ready. Default: false */
  shouldObscureBackgroundPaneContentWhileResizing?: boolean;
}
