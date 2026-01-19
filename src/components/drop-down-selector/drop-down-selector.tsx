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
  const theme = useAppTheme();
  const { primary, error } = theme.colors;
  const [isFocus, setIsFocus] = useState(false);
  const hasLabel = !!label;
  const styles = useStyles({ isFocus, hasLabel });

  return (
    <View>
      {hasLabel && (
        <Text variant='bodySmall' style={[styles.dropdownTitle, isFocus && { color: primary }, isError && { color: error }]}>{label}</Text>
      )}

      <Dropdown
        style={[styles.dropdown, isFocus && { borderColor: primary }, isError && { borderColor: error }]}
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
        placeholder={isFocus ? '' : placeholder}
        searchPlaceholder={searchPlaceholder}
        value={value}
        disable={disabled}
        onFocus={() => setIsFocus(true)}
        onBlur={() => setIsFocus(false)}
        onChange={({ value }) => {
          onChange(value);
          setIsFocus(false);
        }}
      />
    </View>
  );
};

type UseStypesProps = {
  isFocus: boolean;
  hasLabel: boolean;
};

const useStyles = ({ isFocus, hasLabel }: UseStypesProps) => {
  const theme = useAppTheme();

  return StyleSheet.create({
    dropdownTitle: {
      position: 'absolute',
      top: -theme.spacing(1),
      left: theme.spacing(1),
      backgroundColor: theme.colors.surface,
      paddingHorizontal: theme.spacing(0.75),
      color: theme.colors.onSurface,
      zIndex: 1,
    },
    dropdown: {
      height: 50,
      borderColor: isFocus ? theme.colors.primary : theme.colors.outline,
      borderWidth: isFocus ? 2 : 1,
      borderRadius: theme.roundness,
      paddingHorizontal: theme.spacing(1),
    },
    icon: {
      marginRight: 5,
    },
    placeholderStyle: {
      fontSize: 16,
      color: isFocus ? theme.colors.primary : theme.colors.secondary,
    },
    selectedTextStyle: {
      fontSize: 16,
      color: isFocus ? theme.colors.primary : theme.colors.secondary,
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
