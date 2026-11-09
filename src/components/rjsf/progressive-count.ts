import { useEffect, useState } from 'react';

/**
 * Objects with more properties than this draw them in batches (rec 24.B). Below it, everything draws
 * at once, as before: a short form has nothing to gain and its fields stay in place from the first
 * frame.
 */
export const PROGRESSIVE_FIELD_THRESHOLD = 30;
/** How many fields each frame adds. The first batch fills a phone screen several times over. */
export const PROGRESSIVE_FIELD_BATCH = 15;

/**
 * How many of `total` items to draw now.
 *
 * Drawing a 155-field form in one pass froze an old Android for about 3 s: every field built and
 * mounted before the first frame. Here the first batch draws at once and each later frame adds the
 * next, so the top of the form is usable almost immediately and the rest fills in below it while
 * the app stays responsive. The total work is the same.
 *
 * The data does not depend on what is drawn: validation and save read the form's data, never its
 * widgets, so a save made before the last batch lands is complete.
 */
export function useProgressiveCount(total: number): number {
  const progressive = total > PROGRESSIVE_FIELD_THRESHOLD;
  const [count, setCount] = useState(() => (progressive ? PROGRESSIVE_FIELD_BATCH : total));

  useEffect(() => {
    if (!progressive || count >= total) return;
    const frame = requestAnimationFrame(() => setCount((current) => current + PROGRESSIVE_FIELD_BATCH));
    return () => cancelAnimationFrame(frame);
  }, [progressive, count, total]);

  return progressive ? Math.min(count, total) : total;
}
