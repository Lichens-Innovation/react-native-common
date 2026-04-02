import { notImplementedYet } from '../utils/platform.utils';

export const detectLanguage = () => {
  notImplementedYet(
    '[i18n] detectLanguage — expo-localization is unavailable; returning fixed fallback locale on Windows desktop',
  );
  return 'fr';
};
