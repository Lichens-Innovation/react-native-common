export const RESIZE_HANDLE = {
  /** Visible handle size along the split line (horizontal: height, vertical: width). habit-hooks-disable non-essential-comment */
  length: 40,

  /** Units passed to `theme.spacing()` for the thin edge of the handle (horizontal: width, vertical: height). habit-hooks-disable non-essential-comment */
  thicknessSpacing: 0.5,

  /** Hit area perpendicular to the drag axis (e.g. split handle strip width/height). habit-hooks-disable non-essential-comment */
  dragTargetCrossAxis: 20,

  dragSpringConfig: { damping: 25, stiffness: 300, mass: 0.8 },
} as const;
