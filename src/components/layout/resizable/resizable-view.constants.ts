/** Layout and sizing tokens for resizable layout components (split views, overlay, etc.). */
export const RESIZE_HANDLE = {
  /** Visible handle size along the split line (horizontal: height, vertical: width). */
  length: 40,

  /** Units passed to `theme.spacing()` for the thin edge of the handle (horizontal: width, vertical: height). */
  thicknessSpacing: 0.5,

  /** Hit area perpendicular to the drag axis (e.g. split handle strip width/height). */
  dragTargetCrossAxis: 20,

  /** Spring config for handle scale feedback while dragging (`withSpring`). */
  dragSpringConfig: { damping: 25, stiffness: 300, mass: 0.8 },
} as const;
