import { isNullish } from '@lichens-innovation/ts-common';
import {
  dateToDateOnlyString,
  formatDateOnlyForDisplay,
  parseDateOnlyToLocalDate,
} from '@lichens-innovation/ts-common/rjsf';
import type { WidgetProps } from '@rjsf/utils';
import type { FunctionComponent } from 'react';
import { NativeDateOrTimePicker } from './picker-field/native-date-or-time-picker';
import { PickerInputField } from './picker-field/picker-input-field';
import { type PickerValueFormat, usePickerWidgetState } from './picker-field/use-picker-widget-state';

const DATE_ONLY_FORMAT: PickerValueFormat = {
  parse: parseDateOnlyToLocalDate,
  formatForDisplay: formatDateOnlyForDisplay,
  serialize: dateToDateOnlyString,
};

export const DateWidget: FunctionComponent<WidgetProps> = (props) => {
  const {
    pickerValue,
    hasValue,
    displayValue,
    isPickerVisible,
    togglePickerVisibility,
    closePicker,
    commitPicked: commitDate,
  } = usePickerWidgetState(props, DATE_ONLY_FORMAT);

  const handlePick = (_: unknown, selectedDate?: Date) => {
    if (!isNullish(selectedDate)) commitDate(selectedDate);
  };

  const handleOpen = () => {
    // The iOS spinner only fires onChange on scroll: commit the shown default so opening an empty field enters it. habit-hooks-disable non-essential-comment
    if (!isPickerVisible && !hasValue) commitDate(pickerValue);
    togglePickerVisibility();
  };

  return (
    <PickerInputField {...props} displayValue={displayValue} icon="calendar" hasValue={hasValue} onOpen={handleOpen}>
      <NativeDateOrTimePicker
        mode="date"
        visible={isPickerVisible}
        value={pickerValue}
        onChange={handlePick}
        onClose={closePicker}
      />
    </PickerInputField>
  );
};
