import { initReactI18next } from 'react-i18next';

import en from './en/common.json';
import fr from './fr/common.json';

import i18next, { ModuleType } from 'i18next';
import { storage } from '../utils/storage';
import { detectLanguage } from './i18n.utils';

const STORAGE_KEY_LANGUAGE = 'appLanguage';

export interface SupportedLanguage {
  code: string;
  selectionLabel: string;
}

export const SUPPORTED_LANGUAGES: SupportedLanguage[] = [
  { code: 'fr', selectionLabel: 'Français' },
  { code: 'en', selectionLabel: 'English' },
];

export const DEFAULT_LANGUAGE = 'fr';

export const storeSelectedLanguage = (newCode: string) => {
  storage.setItem(STORAGE_KEY_LANGUAGE, newCode);
};

export const loadSelectedLanguage = (): string => {
  return storage.getItem(STORAGE_KEY_LANGUAGE, DEFAULT_LANGUAGE);
};

export const languageDetector = {
  type: 'languageDetector' as ModuleType,
  async: false,
  detect: detectLanguage,
  init: () => {},
  cacheUserLanguage: () => {},
};

const initI18N = () => {
  const savedLanguage = loadSelectedLanguage();
  if (!savedLanguage) {
    storeSelectedLanguage(DEFAULT_LANGUAGE);
  }

  i18next
    .use(languageDetector)
    .use(initReactI18next)
    .init({
      resources: { fr, en },
      defaultNS: 'common',
      fallbackLng: DEFAULT_LANGUAGE,
      lng: savedLanguage || DEFAULT_LANGUAGE,
      debug: false,
      interpolation: {
        escapeValue: false, // not needed for react as it escapes by default
      },
    });
};

initI18N();

export default i18next;
