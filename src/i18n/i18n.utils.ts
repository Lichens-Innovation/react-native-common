import * as Localization from 'expo-localization';

export const detectLanguage = () => {
  const deviceLanguage = Localization.getLocales()[0]?.languageTag;
  return deviceLanguage ? deviceLanguage : 'en';
};
