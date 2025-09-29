import { DarkTheme as DarkNavigationTheme, DefaultTheme as LightNavigationTheme } from '@react-navigation/native';
import { MD3DarkTheme, MD3LightTheme, adaptNavigationTheme, useTheme } from 'react-native-paper';
import { DARK_COLORS_SCHEME } from './dark-colors-scheme';
import { LIGHT_COLORS_SCHEME } from './light-colors-scheme';
const DEFAULT_SPACING = 8;
const spacing = (units = 1) => units * DEFAULT_SPACING;
const roundness = 2;
export const DARK_THEME = Object.assign(Object.assign({}, MD3DarkTheme), { colors: Object.assign(Object.assign({}, MD3DarkTheme.colors), DARK_COLORS_SCHEME), spacing,
    roundness });
export const LIGHT_THEME = Object.assign(Object.assign({}, MD3LightTheme), { colors: Object.assign(Object.assign({}, MD3LightTheme.colors), LIGHT_COLORS_SCHEME), spacing,
    roundness });
// React Navigation themes
const navigationAdaptedThemes = adaptNavigationTheme({
    reactNavigationLight: LightNavigationTheme,
    reactNavigationDark: DarkNavigationTheme,
    materialLight: LIGHT_THEME,
    materialDark: DARK_THEME,
});
const { DarkTheme, LightTheme } = navigationAdaptedThemes;
export const NAVIGATION_DARK = Object.assign(Object.assign({}, DarkTheme), { fonts: Object.assign({}, DarkNavigationTheme.fonts) });
export const NAVIGATION_LIGHT = Object.assign(Object.assign({}, LightTheme), { fonts: Object.assign({}, LightNavigationTheme.fonts) });
export const useAppTheme = () => useTheme();
export const useIsDarkMode = () => {
    const theme = useAppTheme();
    return theme.dark;
};
//# sourceMappingURL=theme.js.map