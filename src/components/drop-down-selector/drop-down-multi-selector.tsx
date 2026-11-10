import { FunctionComponent, useCallback, useMemo } from 'react';
import { View } from 'react-native';
import { MultiSelect } from 'react-native-element-dropdown';
import { DropDownClearButton } from './drop-down-clear-button';
import { DropDownFieldTitle } from './drop-down-field-title';
import { getDropdownContainerStyle } from './drop-down-selector.utils';
import { DropDownSelectorItem } from './drop-down-selector-item';
import { DropDownSelectorLeftIcon } from './drop-down-selector-left-icon';
import { useDropDownField } from './use-drop-down-field';

export interface MultiSelectOption {
  label: string;
  value: string;
  icon?: string;
}

export interface DropDownMultiSelectorProps {
  label?: string;
  value?: string[];
  onChange: (codes: string[]) => void;
  isError?: boolean;
  options: MultiSelectOption[];
  placeholder?: string;
  searchPlaceholder?: string;
  disabled?: boolean;
  modal?: boolean; // If true, opens the dropdown in a modal (useful for better UX on smaller screens)
  showDeleteButton?: boolean;
  disabledTransparentBackground?: boolean;
  /** Overrides the resting label color (ignored while in error/disabled state). habit-hooks-disable non-essential-comment */
  labelColor?: string;
}

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
  showDeleteButton = false,
  disabledTransparentBackground = false,
  labelColor,
}) => {
  const { isFocused, setIsFocused, textColor, styles, handleFocus, handleBlur } = useDropDownField({
    disabled,
    isError,
    disabledTransparentBackground,
    labelColor,
  });

  const firstSelectedItem = useMemo(() => options.find((option) => value?.includes(option.value)), [options, value]);

  const handleChange = useCallback(
    (items: string[]) => {
      onChange(items);
      setIsFocused(false);
    },
    [onChange, setIsFocused]
  );

  return (
    <View>
      <DropDownFieldTitle label={label} style={styles.dropdownTitle} />

      <MultiSelect
        style={[styles.dropdown, styles.multiDropdown]}
        containerStyle={modal ? undefined : getDropdownContainerStyle()}
        placeholderStyle={styles.placeholderStyle}
        selectedTextStyle={[styles.selectedTextStyle, styles.multiSelectedTextStyle]}
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
        onFocus={handleFocus}
        onBlur={handleBlur}
        selectedStyle={styles.multiSelectedStyle}
        onChange={handleChange}
        renderItem={(item, selected) => <DropDownSelectorItem item={item} selected={selected} textColor={textColor} />}
        renderLeftIcon={() => <DropDownSelectorLeftIcon icon={firstSelectedItem?.icon} color={textColor} />}
      />
      {showDeleteButton && !!value && value.length > 0 && !disabled && (
        <DropDownClearButton onPress={() => onChange([])} style={styles.deleteButton} />
      )}
    </View>
  );
};
