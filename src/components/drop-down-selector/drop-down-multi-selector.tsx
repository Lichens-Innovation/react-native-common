import { FunctionComponent, useState } from 'react';
import { StyleSheet, View } from 'react-native';
import { MultiSelect } from 'react-native-element-dropdown';
import { Text } from 'react-native-paper';
import { useAppTheme } from '../../theme/theme';
import { getBorderColor, getLabelColor, getTextColor } from './drop-down-selector.utils';
import { DropDownSelectorItem } from './drop-down-selector-item';
import { DropDownSelectorLeftIcon } from './drop-down-selector-left-icon';

export interface MultiSelectOption {
  label: string;
  value: string;
  icon?: string;
}

export type DropDownMultiSelectorProps = {
  label?: string;
  value?: string[];
  onChange: (codes: string[]) => void;
  isError?: boolean;
  options: MultiSelectOption[];
  placeholder?: string;
  searchPlaceholder?: string;
  disabled?: boolean;
  modal?: boolean; // If true, opens the dropdown in a modal (useful for better UX on smaller screens)
};

export const DropDownMultiSelector: FunctionComponent<DropDownMultiSelectorProps> = ({
  label,
  value,
  onChange,
  isError,
  options,
  placeholder,
  searchPlaceholder,
  disabled,
  modal,
}) => {
  const [isFocused, setIsFocused] = useState(false);
  const hasLabel = !!label;
  const theme = useAppTheme();
  const isDisabled = disabled === true;
  const textColor = getTextColor({ theme, isFocused, isDisabled });
  const styles = useStyles({ isFocused, disabled, isError, textColor });

  // For left icon, show icon of first selected item if any
  const selectedItem = options.find((option) => value?.includes(option.value));

  return (
    <View>
      {hasLabel && (
        <Text variant="bodySmall" style={styles.dropdownTitle}>
          {label}
        </Text>
      )}

      <MultiSelect
        style={styles.dropdown}
        placeholderStyle={styles.placeholderStyle}
        selectedTextStyle={styles.selectedTextStyle}
        data={options}
        search={false}
        searchPlaceholder={searchPlaceholder}
        maxHeight={300}
        labelField="label"
        valueField="value"
        mode={modal ? 'modal' : 'default'}
        placeholder={isFocused ? '' : placeholder}
        value={value}
        disable={disabled}
        onFocus={() => setIsFocused(true)}
        onBlur={() => setIsFocused(false)}
        selectedStyle={styles.selectedStyle}
        onChange={(items: string[]) => {
          onChange(items);
          setIsFocused(false);
        }}
        renderItem={(item: MultiSelectOption, selected?: boolean) => (
          <DropDownSelectorItem item={item} selected={selected} textColor={textColor} />
        )}
        renderLeftIcon={() => <DropDownSelectorLeftIcon icon={selectedItem?.icon} color={textColor} />}
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
      marginBottom: theme.spacing(1),
      backgroundColor,
    },
    placeholderStyle: {
      color: textColor,
    },
    selectedTextStyle: {
      color: textColor,
      paddingLeft: theme.spacing(1),
      maxWidth: 180,
      flexShrink: 1,
      overflow: 'hidden',
    },
    selectedStyle: {
      borderRadius: theme.roundness,
      maxWidth: 220,
      flexDirection: 'row',
      alignItems: 'center',
      flexShrink: 1,
      alignSelf: 'flex-start',
    },
  });
};
