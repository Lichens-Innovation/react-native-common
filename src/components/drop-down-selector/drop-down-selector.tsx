import { isNotBlank } from '@lichens-innovation/ts-common';
import { FunctionComponent, useCallback, useMemo } from 'react';
import { View } from 'react-native';
import { Dropdown } from 'react-native-element-dropdown';
import { DropDownClearButton } from './drop-down-clear-button';
import { DropDownFieldTitle } from './drop-down-field-title';
import { getDropdownContainerStyle } from './drop-down-selector.utils';
import { DropDownSelectorItem } from './drop-down-selector-item';
import { DropDownSelectorLeftIcon } from './drop-down-selector-left-icon';
import { useDropDownField } from './use-drop-down-field';

export interface SelectOption {
  label: string;
  value: string;
  icon?: string;
}

export interface DropDownSelectorProps {
  label?: string;
  value?: string;
  onChange: (code: string) => void;
  isError?: boolean;
  options: SelectOption[];
  placeholder?: string;
  searchPlaceholder?: string;
  disabled?: boolean;
  showDeleteButton?: boolean;
  disabledTransparentBackground?: boolean;
  /** Overrides the resting label color (ignored while in error/disabled state). habit-hooks-disable non-essential-comment */
  labelColor?: string;
}

export const DropDownSelector: FunctionComponent<DropDownSelectorProps> = ({
  label,
  value,
  onChange,
  isError,
  options,
  placeholder,
  searchPlaceholder,
  disabled,
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

  const selectedItem = useMemo(() => options.find((option) => option.value === value), [options, value]);

  const handleChange = useCallback(
    (item: SelectOption) => {
      onChange(item.value);
      setIsFocused(false);
    },
    [onChange, setIsFocused]
  );

  return (
    <View>
      <DropDownFieldTitle label={label} style={styles.dropdownTitle} />

      <Dropdown
        style={styles.dropdown}
        containerStyle={getDropdownContainerStyle()}
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
        onFocus={handleFocus}
        onBlur={handleBlur}
        onChange={handleChange}
        renderItem={(item, selected) => <DropDownSelectorItem item={item} selected={selected} textColor={textColor} />}
        renderLeftIcon={() => <DropDownSelectorLeftIcon icon={selectedItem?.icon} color={textColor} />}
      />
      {showDeleteButton && isNotBlank(value) && !disabled && (
        <DropDownClearButton onPress={() => onChange('')} style={styles.deleteButton} />
      )}
    </View>
  );
};
