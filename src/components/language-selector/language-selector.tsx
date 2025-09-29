import { FunctionComponent } from 'react';

import { DropDownSelector } from '../drop-down-selector/drop-down-selector';
import { LanguageSelectorProps } from './language-selector.types';

export const LanguageSelector: FunctionComponent<LanguageSelectorProps> = ({
  onLanguageChange,
  label,
  currentLanguage,
  supportedLanguages,
  placeholder,
  searchPlaceholder,
}) => {
  const options = supportedLanguages.map((lang) => ({
    label: lang.selectionLabel,
    value: lang.code,
  }));

  return (
    <DropDownSelector
      label={label}
      value={currentLanguage}
      onChange={onLanguageChange}
      options={options}
      placeholder={placeholder}
      searchPlaceholder={searchPlaceholder}
    />
  );
};
