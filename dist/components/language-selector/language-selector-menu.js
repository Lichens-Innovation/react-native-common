import { jsx as _jsx } from "react/jsx-runtime";
import { useToggle } from '@uidotdev/usehooks';
import { Button, Menu } from 'react-native-paper';
export const LanguageSelectorMenu = ({ onLanguageChange, label, currentLanguage, supportedLanguages, }) => {
    const [isMenuVisible, toggleMenu] = useToggle(false);
    const actionLabel = `${label} (${currentLanguage})`;
    const onLanguageSelected = (newCode) => {
        onLanguageChange(newCode);
        toggleMenu(false);
    };
    return (_jsx(Menu, { visible: isMenuVisible, onDismiss: () => toggleMenu(false), anchorPosition: "bottom", anchor: _jsx(Button, { mode: "outlined", onPress: () => toggleMenu(true), icon: "translate", children: actionLabel }), children: supportedLanguages.map(({ code, selectionLabel }) => (_jsx(Menu.Item, { title: `${selectionLabel} (${code})`, trailingIcon: code === currentLanguage ? 'check' : undefined, onPress: () => onLanguageSelected(code) }, code))) }));
};
//# sourceMappingURL=language-selector-menu.js.map