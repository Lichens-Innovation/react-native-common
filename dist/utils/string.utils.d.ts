export declare const isBlank: (str?: string | null) => str is null | undefined | "";
export declare const isNotBlank: (str?: string | null) => str is string;
export declare const isAlphanumeric: (value: string) => boolean;
/**
 * Removes diacritical marks (e.g., accents, umlauts) from a string.
 * This method normalizes the input string to its canonical decomposition
 * form (NFD) and removes any combining diacritical marks.
 *
 * @param {string} value - The input string to normalize.
 * @returns {string} - The normalized string with diacritical marks removed.
 *
 * @example
 * const result = removeDiacriticalMarks("Ça va très bien, n'est-ce pas?");
 * console.log(result); // "Ca va tres bien, n'est-ce pas?"
 */
export declare const removeDiacriticalMarks: (value: string) => string;
