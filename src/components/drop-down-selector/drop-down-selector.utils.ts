import { Platform, StatusBar, ViewStyle } from 'react-native';
import { AppTheme } from '../../theme';

/**
 * react-native-element-dropdown adds `StatusBar.currentHeight` to the position measured with `measureInWindow`.
 * With Android edge-to-edge (mandatory since RN 0.81) the measure already includes the status bar, so the list
 * is rendered one status bar height below its anchor. This style shifts the list back into place.
 */
export const getDropdownContainerStyle = (): ViewStyle | undefined => {
  const statusBarHeight = StatusBar.currentHeight ?? 0;
  if (Platform.OS !== 'android' || statusBarHeight === 0) {
    return undefined;
  }

  return { transform: [{ translateY: -statusBarHeight }] };
};

interface GetTextColorArgs {
  theme: AppTheme;
  isFocused: boolean;
  isDisabled: boolean;
}
export const getTextColor = ({ theme, isFocused, isDisabled }: GetTextColorArgs) => {
  const { onSurfaceDisabled, primary, secondary } = theme.colors;

  if (isDisabled) {
    return onSurfaceDisabled;
  }

  if (isFocused) {
    return primary;
  }

  return secondary;
};

interface GetLabelColorArgs {
  theme: AppTheme;
  isError: boolean;
  isDisabled: boolean;
  isFocusedAndEnabled: boolean;
}
export const getLabelColor = ({ theme, isError, isDisabled, isFocusedAndEnabled }: GetLabelColorArgs) => {
  const { error, onSurfaceDisabled, primary, onSurface } = theme.colors;

  if (isError) {
    return error;
  }

  if (isDisabled) {
    return onSurfaceDisabled;
  }

  if (isFocusedAndEnabled) {
    return primary;
  }

  return onSurface;
};

interface GetBorderColorArgs {
  theme: AppTheme;
  isError: boolean;
  isDisabled: boolean;
  isFocused: boolean;
}
export const getBorderColor = ({ theme, isError, isDisabled, isFocused }: GetBorderColorArgs) => {
  const { error, surfaceDisabled, primary, outline } = theme.colors;

  if (isError) {
    return error;
  }

  if (isDisabled) {
    return surfaceDisabled;
  }

  if (isFocused) {
    return primary;
  }

  return outline;
};
