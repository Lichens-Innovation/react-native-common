import { jsx as _jsx } from "react/jsx-runtime";
import { SegmentedButtons } from 'react-native-paper';
export const LanguageSelectorSegmented = ({ onLanguageChange, currentLanguage, supportedLanguages, }) => {
    return (_jsx(SegmentedButtons, { value: currentLanguage, onValueChange: onLanguageChange, style: { minWidth: supportedLanguages.length * 100 }, buttons: supportedLanguages.map(({ code, selectionLabel }) => ({
            value: code,
            label: selectionLabel,
        })) }));
};
//# sourceMappingURL=language-selector-segmented.js.map