import { FunctionComponent } from 'react';

import { useToggle } from '@uidotdev/usehooks';
import { Button, Menu } from 'react-native-paper';
import { LanguageSelectorProps } from './language-selector.types';

export const LanguageSelectorMenu: FunctionComponent<LanguageSelectorProps> = ({
  onLanguageChange,
  label,
  currentLanguage,
  supportedLanguages,
}) => {
  const [isMenuVisible, toggleMenu] = useToggle(false);
  const actionLabel = `${label} (${currentLanguage})`;

  const onLanguageSelected = (newCode: string) => {
    onLanguageChange(newCode);
    toggleMenu(false);
  };

  return (
    <Menu
      visible={isMenuVisible}
      onDismiss={() => toggleMenu(false)}
      anchorPosition="bottom"
      anchor={
        <Button mode="outlined" onPress={() => toggleMenu(true)} icon="translate">
          {actionLabel}
        </Button>
      }
    >
      {supportedLanguages.map(({ code, selectionLabel }) => (
        <Menu.Item
          key={code}
          title={`${selectionLabel} (${code})`}
          trailingIcon={code === currentLanguage ? 'check' : undefined}
          onPress={() => onLanguageSelected(code)}
        />
      ))}
    </Menu>
  );
};
