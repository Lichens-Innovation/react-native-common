import { useCallback, useMemo, useState } from 'react';
import { StyleSheet } from 'react-native';
import { AppTheme, useAppTheme } from '../../theme/theme';
import { DropDownFieldColors, getDropDownFieldColors, getTextColor } from './drop-down-selector.utils';

export interface UseDropDownFieldArgs {
  disabled?: boolean;
  isError?: boolean;
  disabledTransparentBackground?: boolean;
  labelColor?: string;
}

interface CreateFieldStylesArgs {
  theme: AppTheme;
  colors: DropDownFieldColors;
  textColor: string;
}

const createFieldStyles = ({ theme, colors, textColor }: CreateFieldStylesArgs) =>
  StyleSheet.create({
    dropdownTitle: {
      position: 'absolute',
      top: -theme.spacing(1),
      left: theme.spacing(1),
      backgroundColor: theme.colors.surface,
      paddingHorizontal: theme.spacing(0.75),
      color: colors.labelColor,
      zIndex: 1,
    },
    dropdown: {
      height: 50,
      borderColor: colors.borderColor,
      borderWidth: colors.borderWidth,
      borderRadius: theme.roundness,
      paddingHorizontal: theme.spacing(1),
      backgroundColor: colors.backgroundColor,
    },
    placeholderStyle: { color: textColor },
    selectedTextStyle: { color: textColor, paddingLeft: theme.spacing(1) },
    deleteButton: { position: 'absolute', right: 0, top: 0, backgroundColor: theme.colors.background },
  });

const createMultiSelectStyles = (theme: AppTheme) =>
  StyleSheet.create({
    multiDropdown: { marginBottom: theme.spacing(1) },
    multiSelectedTextStyle: { maxWidth: 180, flexShrink: 1, overflow: 'hidden' },
    multiSelectedStyle: {
      borderRadius: theme.roundness,
      maxWidth: 220,
      flexDirection: 'row',
      alignItems: 'center',
      flexShrink: 1,
      alignSelf: 'flex-start',
    },
  });

export const useDropDownField = ({
  disabled,
  isError,
  disabledTransparentBackground,
  labelColor,
}: UseDropDownFieldArgs) => {
  const [isFocused, setIsFocused] = useState(false);
  const theme = useAppTheme();
  const textColor = getTextColor({ theme, isFocused, isDisabled: disabled === true });

  const styles = useMemo(() => {
    const colors = getDropDownFieldColors({
      theme,
      isFocused,
      disabled,
      isError,
      disabledTransparentBackground,
      labelColorOverride: labelColor,
    });
    return { ...createFieldStyles({ theme, colors, textColor }), ...createMultiSelectStyles(theme) };
  }, [theme, isFocused, disabled, isError, textColor, disabledTransparentBackground, labelColor]);

  const handleFocus = useCallback(() => setIsFocused(true), []);
  const handleBlur = useCallback(() => setIsFocused(false), []);

  return { isFocused, setIsFocused, textColor, styles, handleFocus, handleBlur };
};
