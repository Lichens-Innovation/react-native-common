import { isNotBlank } from '@lichens-innovation/ts-common';
import { Platform, StatusBar, ViewStyle } from 'react-native';
import { AppTheme } from '../../theme/theme.index';

/** habit-hooks-disable non-essential-comment
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
const getLabelColor = ({ theme, isError, isDisabled, isFocusedAndEnabled }: GetLabelColorArgs) => {
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
const getBorderColor = ({ theme, isError, isDisabled, isFocused }: GetBorderColorArgs) => {
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

interface GetBackgroundColorArgs {
  theme: AppTheme;
  isDisabled: boolean;
  disabledTransparentBackground: boolean;
}
const getBackgroundColor = ({ theme, isDisabled, disabledTransparentBackground }: GetBackgroundColorArgs) => {
  if (isDisabled && !disabledTransparentBackground) {
    return theme.colors.surfaceDisabled;
  }

  return 'transparent';
};

interface GetFieldLabelColorArgs {
  theme: AppTheme;
  isError: boolean;
  isDisabled: boolean;
  isFocusedAndEnabled: boolean;
  labelColorOverride?: string;
}
const getFieldLabelColor = ({ labelColorOverride, ...args }: GetFieldLabelColorArgs) => {
  const canOverride = isNotBlank(labelColorOverride) && !args.isError && !args.isDisabled;
  return canOverride ? labelColorOverride : getLabelColor(args);
};

export interface GetDropDownFieldColorsArgs {
  theme: AppTheme;
  isFocused: boolean;
  disabled?: boolean;
  isError?: boolean;
  disabledTransparentBackground?: boolean;
  labelColorOverride?: string;
}
export interface DropDownFieldColors {
  labelColor: string;
  borderColor: string;
  borderWidth: number;
  backgroundColor: string;
}

export const getDropDownFieldColors = ({
  theme,
  isFocused,
  disabled,
  isError,
  disabledTransparentBackground = false,
  labelColorOverride,
}: GetDropDownFieldColorsArgs): DropDownFieldColors => {
  const isDisabled = disabled === true;
  const hasError = isError === true;
  const isFocusedAndEnabled = isFocused && !isDisabled;

  return {
    labelColor: getFieldLabelColor({ theme, isError: hasError, isDisabled, isFocusedAndEnabled, labelColorOverride }),
    borderColor: getBorderColor({ theme, isError: hasError, isDisabled, isFocused }),
    borderWidth: isFocusedAndEnabled ? 2 : 1,
    backgroundColor: getBackgroundColor({ theme, isDisabled, disabledTransparentBackground }),
  };
};
