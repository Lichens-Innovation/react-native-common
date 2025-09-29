import { jsx as _jsx } from "react/jsx-runtime";
import { DropDownSelector } from '../drop-down-selector/drop-down-selector';
export const LanguageSelector = ({ onLanguageChange, label, currentLanguage, supportedLanguages, placeholder, searchPlaceholder, }) => {
    const options = supportedLanguages.map((lang) => ({
        label: lang.selectionLabel,
        value: lang.code,
    }));
    return (_jsx(DropDownSelector, { label: label, value: currentLanguage, onChange: onLanguageChange, options: options, placeholder: placeholder, searchPlaceholder: searchPlaceholder }));
};
//# sourceMappingURL=language-selector.js.map