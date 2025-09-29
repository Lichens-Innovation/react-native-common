import { REGEX_ALPHANUMERIC } from './regex';
import { isNullish } from './types.utils';

export const isBlank = (str?: string | null): str is null | undefined | '' => {
  return isNullish(str) || str?.trim() === '';
};

export const isNotBlank = (str?: string | null): str is string => {
  return !isBlank(str);
};

export const isAlphanumeric = (value: string): boolean => {
  return REGEX_ALPHANUMERIC.test(value);
};

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
export const removeDiacriticalMarks = (value: string): string => {
  if (!value) {
    return '';
  }

  return value.normalize('NFD').replace(/[\u0300-\u036f]/g, '');
};
