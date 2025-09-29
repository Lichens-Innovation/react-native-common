import i18next, { ModuleType } from 'i18next';
export interface SupportedLanguage {
    code: string;
    selectionLabel: string;
}
export declare const SUPPORTED_LANGUAGES: SupportedLanguage[];
export declare const DEFAULT_LANGUAGE = "fr";
export declare const storeSelectedLanguage: (newCode: string) => void;
export declare const loadSelectedLanguage: () => string;
export declare const languageDetector: {
    type: ModuleType;
    async: boolean;
    detect: () => string;
    init: () => void;
    cacheUserLanguage: () => void;
};
export default i18next;
