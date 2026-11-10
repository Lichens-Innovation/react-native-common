import { ReactNode } from 'react';
import { StyleProp, ViewStyle } from 'react-native';

export type ResizableOverlayViewAnchorType = 'topLeft' | 'topRight' | 'bottomLeft' | 'bottomRight';

export interface ResizableOverlayViewProps {
  foregroundContent: ReactNode;
  backgroundContent: ReactNode;
  /** Where the overlay is anchored inside the container. Default: topRight habit-hooks-disable non-essential-comment */
  anchorType?: ResizableOverlayViewAnchorType;
  /** Initial height ratio for the foreground overlay (0 to 1). Default: 0.5 habit-hooks-disable non-essential-comment */
  initialForegroundRatio?: number;
  /** Minimum height ratio for the foreground overlay (0 to 1). Default: 0.15 habit-hooks-disable non-essential-comment */
  minForegroundRatio?: number;
  /** Maximum height ratio for the foreground overlay (0 to 1). Default: 0.85 habit-hooks-disable non-essential-comment */
  maxForegroundRatio?: number;
  /** Aspect ratio (width/height) for the foreground content. If provided, width will be calculated based on height habit-hooks-disable non-essential-comment */
  foregroundContentAspectRatio?: number;
  handleContainerStyle?: StyleProp<ViewStyle>;
  handleStyle?: StyleProp<ViewStyle>;
  /** Whether to hide the drag handle. Default: false habit-hooks-disable non-essential-comment */
  hideHandle?: boolean;

  /** When true, obscures the foreground pane content while resizing or before layout is ready. Default: false habit-hooks-disable non-essential-comment */
  shouldObscureForegroundPaneContentWhileResizing?: boolean;
  /** When true, obscures the background pane content while resizing or before layout is ready. Default: false habit-hooks-disable non-essential-comment */
  shouldObscureBackgroundPaneContentWhileResizing?: boolean;
}
