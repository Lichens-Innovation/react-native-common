import { FunctionComponent } from 'react';

import { SegmentedButtons } from 'react-native-paper';
import { LanguageSelectorProps } from './language-selector.types';

export const LanguageSelectorSegmented: FunctionComponent<LanguageSelectorProps> = ({
  onLanguageChange,
  currentLanguage,
  supportedLanguages,
}) => {
  return (
    <SegmentedButtons
      value={currentLanguage}
      onValueChange={onLanguageChange}
      style={{ minWidth: supportedLanguages.length * 100 }}
      buttons={supportedLanguages.map(({ code, selectionLabel }) => ({
        value: code,
        label: selectionLabel,
      }))}
    />
  );
};
