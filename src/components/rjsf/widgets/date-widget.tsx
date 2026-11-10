import { isNullish } from '@lichens-innovation/ts-common';
import {
  dateToDateOnlyString,
  formatDateOnlyForDisplay,
  parseDateOnlyToLocalDate,
} from '@lichens-innovation/ts-common/rjsf';
import DateTimePicker from '@react-native-community/datetimepicker';
import type { WidgetProps } from '@rjsf/utils';
import type { FunctionComponent } from 'react';
import { Platform } from 'react-native';
import { IosPickerModal } from './picker-field/ios-picker-modal';
import { PickerInputField } from './picker-field/picker-input-field';
import { usePickerThemeVariant } from './picker-field/use-picker-theme-variant';
import { usePickerWidgetState } from './picker-field/use-picker-widget-state';
import { useCommitWidgetValue } from './shared/use-commit-widget-value';

export const DateWidget: FunctionComponent<WidgetProps> = (props) => {
  const { value } = props;
  const themeVariant = usePickerThemeVariant();
  const commitValue = useCommitWidgetValue(props);
  const { pickerValue, hasValue, displayValue, isPickerVisible, togglePickerVisibility, closePicker } =
    usePickerWidgetState({
      value,
      parse: parseDateOnlyToLocalDate,
      formatForDisplay: formatDateOnlyForDisplay,
    });

  const commitDate = (picked: Date) => commitValue(dateToDateOnlyString(picked));

  const handlePick = (_: unknown, selectedDate?: Date) => {
    if (Platform.OS === 'android') closePicker();
    if (!isNullish(selectedDate)) commitDate(selectedDate);
  };

  const handleOpen = () => {
    // The iOS spinner only fires onChange on scroll: commit the shown default so opening an empty field enters it. habit-hooks-disable non-essential-comment
    if (!isPickerVisible && !hasValue) commitDate(pickerValue);
    togglePickerVisibility();
  };

  return (
    <PickerInputField {...props} displayValue={displayValue} icon="calendar" hasValue={hasValue} onOpen={handleOpen}>
      {Platform.OS === 'ios' ? (
        <IosPickerModal
          visible={isPickerVisible}
          value={pickerValue}
          mode="date"
          onChange={handlePick}
          onClose={closePicker}
        />
      ) : (
        isPickerVisible && (
          <DateTimePicker
            value={pickerValue}
            mode="date"
            display="default"
            onChange={handlePick}
            onTouchCancel={closePicker}
            themeVariant={themeVariant}
          />
        )
      )}
    </PickerInputField>
  );
};
