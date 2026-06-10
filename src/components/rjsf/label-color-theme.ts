import type { AppTheme } from '../../theme';

/**
 * Builds a Paper theme override that recolors a TextInput's floating label to `labelColor`.
 *
 * Paper exposes no per-label color prop, so we override the theme colors that drive the
 * floating label (resting = onSurfaceVariant, active = primary). Returns undefined when no
 * color is set so the input falls back to the ambient context theme.
 *
 * Note: this also tints that input's placeholder/affix/cursor (shared color tokens) — accepted
 * trade-off for label coloring.
 */
export const mergeLabelColorTheme = (theme: AppTheme, labelColor?: string): AppTheme | undefined => {
  if (!labelColor) return undefined;
  return {
    ...theme,
    colors: {
      ...theme.colors,
      onSurfaceVariant: labelColor,
      primary: labelColor,
    },
  };
};
