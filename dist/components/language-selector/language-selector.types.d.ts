import { SupportedLanguage } from '../../i18n/i18n';
export interface LanguageSelectorProps {
    label?: string;
    currentLanguage: string;
    supportedLanguages: SupportedLanguage[];
    onLanguageChange: (language: string) => void;
    placeholder?: string;
    searchPlaceholder?: string;
}
