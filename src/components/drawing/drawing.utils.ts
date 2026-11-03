/**
 * A drawing is stored as ONE SVG path string in a fixed 3:1 coordinate box, never as markup or pixels:
 * every renderer (the pad, the read-only view, the web, a PDF) builds its own `<svg>` around it with
 * the same viewBox, so the drawing scales to any box of that ratio and carries no device size.
 *
 * Each stroke starts with its own `M`, so lifting the finger between letters keeps them apart.
 */
export const DRAWING_VIEWBOX = { width: 300, height: 100 } as const;

export const DRAWING_VIEWBOX_ATTR = `0 0 ${DRAWING_VIEWBOX.width} ${DRAWING_VIEWBOX.height}`;

export const DRAWING_ASPECT_RATIO = DRAWING_VIEWBOX.width / DRAWING_VIEWBOX.height;

/** Dark ink on a white box in both themes, so a drawing looks the same everywhere it is shown. */
export const DRAWING_INK = '#1a1a1a';
export const DRAWING_PAPER = '#ffffff';
export const DRAWING_STROKE_WIDTH = 2.5;

export type DrawingPoint = { x: number; y: number };

const roundTenth = (value: number) => Math.round(value * 10) / 10;

const clamp = (value: number, max: number) => Math.min(Math.max(value, 0), max);

/**
 * A touch point in the pad's pixels, converted to viewBox units and rounded to 1 decimal place: finer
 * than any finger and keeps the stored string short. A point dragged past the edge sticks to it.
 */
export const toViewBoxPoint = (x: number, y: number, padWidth: number, padHeight: number): DrawingPoint => {
  if (padWidth <= 0 || padHeight <= 0) return { x: 0, y: 0 };
  return {
    x: roundTenth(clamp((x / padWidth) * DRAWING_VIEWBOX.width, DRAWING_VIEWBOX.width)),
    y: roundTenth(clamp((y / padHeight) * DRAWING_VIEWBOX.height, DRAWING_VIEWBOX.height)),
  };
};

const formatPoint = ({ x, y }: DrawingPoint) => `${x} ${y}`;

const joinCommand = (path: string, command: string) => (path.trim() ? `${path.trim()} ${command}` : command);

/**
 * Starts a stroke. It is written as a zero-length segment (`M p L p`) so a tap with no movement still
 * leaves a dot: a lone `M` draws nothing, while round caps paint a zero-length line as a dot.
 */
export const appendStrokeStart = (path: string, point: DrawingPoint): string => {
  const p = formatPoint(point);
  return joinCommand(path, `M${p} L${p}`);
};

const LAST_POINT = /(-?\d+(?:\.\d+)?) (-?\d+(?:\.\d+)?)$/;

/** Continues the current stroke; a point equal to the last one adds nothing. */
export const appendStrokePoint = (path: string, point: DrawingPoint): string => {
  const p = formatPoint(point);
  const last = LAST_POINT.exec(path.trim());
  if (last && `${last[1]} ${last[2]}` === p) return path;
  return joinCommand(path, `L${p}`);
};

export const isEmptyPath = (path?: string | null): boolean => !path || !path.trim();
