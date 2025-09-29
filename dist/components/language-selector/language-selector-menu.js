import { useToggle } from '@uidotdev/usehooks';
import { Button, Menu } from 'react-native-paper';
export const LanguageSelectorMenu = ({ onLanguageChange, label, currentLanguage, supportedLanguages, }) => {
    const [isMenuVisible, toggleMenu] = useToggle(false);
    const actionLabel = `${label} (${currentLanguage})`;
    const onLanguageSelected = (newCode) => {
        onLanguageChange(newCode);
        toggleMenu(false);
    };
    return (<Menu visible={isMenuVisible} onDismiss={() => toggleMenu(false)} anchorPosition="bottom" anchor={<Button mode="outlined" onPress={() => toggleMenu(true)} icon="translate">
          {actionLabel}
        </Button>}>
      {supportedLanguages.map(({ code, selectionLabel }) => (<Menu.Item key={code} title={`${selectionLabel} (${code})`} trailingIcon={code === currentLanguage ? 'check' : undefined} onPress={() => onLanguageSelected(code)}/>))}
    </Menu>);
};
//# sourceMappingURL=language-selector-menu.js.map