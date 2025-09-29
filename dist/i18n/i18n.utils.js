import * as Localization from 'expo-localization';
export const detectLanguage = () => {
    var _a;
    const deviceLanguage = (_a = Localization.getLocales()[0]) === null || _a === void 0 ? void 0 : _a.languageTag;
    return deviceLanguage ? deviceLanguage : 'en';
};
//# sourceMappingURL=i18n.utils.js.map