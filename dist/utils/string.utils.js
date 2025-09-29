import { REGEX_ALPHANUMERIC } from './regex';
import { isNullish } from './types.utils';
export const isBlank = (str) => {
    return isNullish(str) || (str === null || str === void 0 ? void 0 : str.trim()) === '';
};
export const isNotBlank = (str) => {
    return !isBlank(str);
};
export const isAlphanumeric = (value) => {
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
export const removeDiacriticalMarks = (value) => {
    if (!value) {
        return '';
    }
    return value.normalize('NFD').replace(/[\u0300-\u036f]/g, '');
};
//# sourceMappingURL=string.utils.js.map