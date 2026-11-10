import { useIsDarkMode } from '../../../../theme/theme.index';

type PickerThemeVariant = 'dark' | 'light';

export const usePickerThemeVariant = (): PickerThemeVariant => (useIsDarkMode() ? 'dark' : 'light');
