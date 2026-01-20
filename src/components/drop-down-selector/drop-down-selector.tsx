import { FunctionComponent, useState } from 'react';
import { StyleSheet, View } from 'react-native';
import { Dropdown } from 'react-native-element-dropdown';
import { Text } from 'react-native-paper';
import { useAppTheme } from '../../theme/theme';
import { getBorderColor, getLabelColor, getTextColor } from './drop-down-selector.utils';
import { DropDownSelectorItem } from './drop-down-selector-item';
import { DropDownSelectorLeftIcon } from './drop-down-selector-left-icon';

export interface SelectOption {
  label: string;
  value: string;
  icon?: string;
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
  const theme = useAppTheme();
  const isDisabled = disabled === true;
  const textColor = getTextColor({ theme, isFocused, isDisabled });
  const styles = useStyles({ isFocused, disabled, isError, textColor });

  const selectedItem = options.find((option) => option.value === value);

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
        data={options}
        search={false}
        searchPlaceholder={searchPlaceholder}
        maxHeight={300}
        labelField="label"
        valueField="value"
        placeholder={isFocused ? '' : placeholder}
        value={value}
        disable={disabled}
        onFocus={() => setIsFocused(true)}
        onBlur={() => setIsFocused(false)}
        onChange={({ value }) => {
          onChange(value);
          setIsFocused(false);
        }}
        renderItem={(item: SelectOption, selected?: boolean) => (
          <DropDownSelectorItem item={item} selected={selected} textColor={textColor} />
        )}
        renderLeftIcon={() => (
          <DropDownSelectorLeftIcon icon={selectedItem?.icon} color={textColor} />
        )}
      />
    </View>
  );
};

type UseStylesProps = {
  isFocused: boolean;
  disabled?: boolean;
  isError?: boolean;
  textColor: string;
};

const useStyles = ({ isFocused, disabled, isError, textColor }: UseStylesProps) => {
  const theme = useAppTheme();
  const { surface, surfaceDisabled } = theme.colors;

  const isDisabled = disabled === true;
  const isFocusedAndEnabled = isFocused && !isDisabled;

  // Priority: error > disabled > focus > normal
  const labelColor = getLabelColor({ theme, isError: !!isError, isDisabled, isFocusedAndEnabled });
  const borderColor = getBorderColor({ theme, isError: !!isError, isDisabled, isFocused });
  const borderWidth = isFocusedAndEnabled ? 2 : 1;

  const backgroundColor = isDisabled ? surfaceDisabled : 'transparent';

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
    placeholderStyle: {
      color: textColor,
    },
    selectedTextStyle: {
      color: textColor,
      paddingLeft: theme.spacing(1),
    },
  });
};
