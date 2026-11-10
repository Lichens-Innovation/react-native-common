import { isNullish } from '@lichens-innovation/ts-common';
import { formatDateTimeForDisplay, parseDateOrNull } from '@lichens-innovation/ts-common/rjsf';
import type { WidgetProps } from '@rjsf/utils';
import type { FunctionComponent } from 'react';
import { Platform } from 'react-native';
import { AndroidDateTimeDialogs } from './picker-field/android-date-time-dialogs';
import { IosPickerModal } from './picker-field/ios-picker-modal';
import { PickerInputField } from './picker-field/picker-input-field';
import { usePickerWidgetState } from './picker-field/use-picker-widget-state';
import { useCommitWidgetValue } from './shared/use-commit-widget-value';

export const DateTimeWidget: FunctionComponent<WidgetProps> = (props) => {
  const { value } = props;
  const commitValue = useCommitWidgetValue(props);
  const { pickerValue, hasValue, displayValue, isPickerVisible, togglePickerVisibility, closePicker } =
    usePickerWidgetState({ value, parse: parseDateOrNull, formatForDisplay: formatDateTimeForDisplay });

  const commitDateTime = (picked: Date) => commitValue(picked.toISOString());

  const handleIosPick = (_: unknown, selectedDate?: Date) => {
    if (!isNullish(selectedDate)) commitDateTime(selectedDate);
  };

  const handleOpen = () => {
    if (Platform.OS === 'android') {
      togglePickerVisibility(true);
      return;
    }

    // The iOS spinner only fires onChange on scroll, so commit the shown default; Android's dialogs return it on OK, and backing out must leave nothing behind. habit-hooks-disable non-essential-comment
    if (!isPickerVisible && !hasValue) commitDateTime(pickerValue);
    togglePickerVisibility();
  };

  return (
    <PickerInputField
      {...props}
      displayValue={displayValue}
      icon="calendar-clock"
      hasValue={hasValue}
      onOpen={handleOpen}
    >
      {Platform.OS === 'ios' ? (
        <IosPickerModal
          visible={isPickerVisible}
          value={pickerValue}
          mode="datetime"
          onChange={handleIosPick}
          onClose={closePicker}
        />
      ) : (
        isPickerVisible && (
          <AndroidDateTimeDialogs value={pickerValue} onConfirm={commitDateTime} onClose={closePicker} />
        )
      )}
    </PickerInputField>
  );
};
