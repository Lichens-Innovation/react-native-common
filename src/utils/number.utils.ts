import { isNullish } from "./types.utils";

// Example: toFixed(3.14159, 3) // 3.142
export const toFixed = (value?: number | null, decimals = 0): number => {
  if (isNullish(value)) return 0;
  if (decimals < 0) throw new Error("[toFixed] decimals must be >= 0");
  if (decimals === 0) return Math.round(value);

  const multiplier = Math.pow(10, decimals);
  return Math.round(value * multiplier) / multiplier;
};
