import { FunctionComponent, useState } from 'react';
import { StyleSheet, View } from 'react-native';
import { Dropdown } from 'react-native-element-dropdown';
import { Text } from 'react-native-paper';
import { useAppTheme } from '../../theme/theme';

export interface SelectOption {
  label: string;
  value: string;
}

export type DropDownSelectorProps = {
  label?: string;
  value?: string;
  onChange: (code: string) => void;
  isError?: boolean;
  options: SelectOption[];
  placeholder?: string;
  searchPlaceholder?: string;
  disabled?: boolean;
};

export const DropDownSelector: FunctionComponent<DropDownSelectorProps> = ({
  label,
  value,
  onChange,
  isError,
  options,
  placeholder,
  searchPlaceholder,
  disabled,
}) => {
  const [isFocused, setIsFocused] = useState(false);
  const hasLabel = !!label;
  const styles = useStyles({ isFocused, disabled, isError });

  return (
    <View>
      {hasLabel && (
        <Text variant='bodySmall' style={styles.dropdownTitle}>{label}</Text>
      )}

      <Dropdown
        style={styles.dropdown}
        autoScroll={false} // @see https://github.com/hoaphantn7604/react-native-element-dropdown/issues/345
        placeholderStyle={styles.placeholderStyle}
        selectedTextStyle={styles.selectedTextStyle}
        inputSearchStyle={styles.inputSearchStyle}
        iconStyle={styles.iconStyle}
        data={options}
        search={false}
        maxHeight={300}
        labelField="label"
        valueField="value"
        placeholder={isFocused ? '' : placeholder}
        searchPlaceholder={searchPlaceholder}
        value={value}
        disable={disabled}
        onFocus={() => setIsFocused(true)}
        onBlur={() => setIsFocused(false)}
        onChange={({ value }) => {
          onChange(value);
          setIsFocused(false);
        }}
      />
    </View>
  );
};

type UseStylesProps = {
  isFocused: boolean;
  disabled?: boolean;
  isError?: boolean;
};

const useStyles = ({ isFocused, disabled, isError }: UseStylesProps) => {
  const theme = useAppTheme();
  const {
    surface,
    onSurface,
    onSurfaceDisabled,
    surfaceDisabled,
    primary,
    outline,
    secondary,
    error
  } = theme.colors;

  const isDisabled = disabled === true;
  const isFocusedAndEnabled = isFocused && !isDisabled;

  // Priority: error > disabled > focus > normal
  const labelColor = isError
    ? error
    : (isDisabled ? onSurfaceDisabled : (isFocusedAndEnabled ? primary : onSurface));

  const borderColor = isError
    ? error
    : (isDisabled ? surfaceDisabled : (isFocused ? primary : outline));
  const borderWidth = isFocusedAndEnabled ? 2 : 1;

  const backgroundColor = isDisabled ? surfaceDisabled : 'transparent';
  const textColor = isDisabled
    ? onSurfaceDisabled
    : (isFocused ? primary : secondary);

  return StyleSheet.create({
    dropdownTitle: {
      position: 'absolute',
      top: -theme.spacing(1),
      left: theme.spacing(1),
      backgroundColor: surface,
      paddingHorizontal: theme.spacing(0.75),
      color: labelColor,
      zIndex: 1,
    },
    dropdown: {
      height: 50,
      borderColor,
      borderWidth,
      borderRadius: theme.roundness,
      paddingHorizontal: theme.spacing(1),
      backgroundColor,
    },
    icon: {
      marginRight: 5,
    },
    placeholderStyle: {
      fontSize: 16,
      color: textColor,
    },
    selectedTextStyle: {
      fontSize: 16,
      color: textColor,
      paddingLeft: theme.spacing(1),
    },
    iconStyle: {
      width: 20,
      height: 20,
    },
    inputSearchStyle: {
      height: 40,
      fontSize: 16,
    },
  });
};
