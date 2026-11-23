import { isNullish } from '@lichens-innovation/ts-common';
import {
  formatTimeOnlyForDisplay,
  parseTimeOnlyToLocalDate,
  timeToTimeOnlyString,
} from '@lichens-innovation/ts-common/rjsf';
import { type DateTimePickerEvent } from '@react-native-community/datetimepicker';
import type { WidgetProps } from '@rjsf/utils';
import type { FunctionComponent } from 'react';
import { Platform } from 'react-native';
import { NativeDateOrTimePicker } from './picker-field/native-date-or-time-picker';
import { PickerInputField } from './picker-field/picker-input-field';
import { type PickerValueFormat, usePickerWidgetState } from './picker-field/use-picker-widget-state';

const TIME_ONLY_FORMAT: PickerValueFormat = {
  parse: parseTimeOnlyToLocalDate,
  formatForDisplay: formatTimeOnlyForDisplay,
  serialize: timeToTimeOnlyString,
};

/** habit-hooks-disable non-essential-comment
 * A clock reading with no day behind it: the date is entered once in the form header and
 * each reading row carries only HH:MM — a micro-purge sheet with one time per station, say.
 *
 * Simpler than DateTimeWidget because `mode="time"` is supported natively on BOTH platforms, so
 * there is none of the two-dialog sequencing that Android's missing datetime mode forced there.
 *
 * Seconds are never entered: neither native picker offers them, and the feature dropped them rather
 * than ship a hand-rolled picker. The stored value still carries `:00` because JSON Schema's "time"
 * format demands seconds, and the display strips them back off.
 */
export const TimeWidget: FunctionComponent<WidgetProps> = (props) => {
  const {
    pickerValue,
    hasValue,
    displayValue,
    isPickerVisible,
    togglePickerVisibility,
    closePicker,
    commitPicked: commitTime,
  } = usePickerWidgetState(props, TIME_ONLY_FORMAT);

  const handlePick = (event: DateTimePickerEvent, selectedTime?: Date) => {
    // Android reports 'dismissed' on back-out (storing then would keep an unconfirmed time); iOS only ever reports 'set'. habit-hooks-disable non-essential-comment
    if (event.type !== 'set' || isNullish(selectedTime)) return;
    commitTime(selectedTime);
  };

  const handleOpen = () => {
    // The iOS spinner only fires onChange on scroll, so commit the shown default; Android's dialog returns it on OK, and a cancel must leave nothing behind. habit-hooks-disable non-essential-comment
    if (Platform.OS !== 'android' && !isPickerVisible && !hasValue) commitTime(pickerValue);
    togglePickerVisibility();
  };

  return (
    <PickerInputField
      {...props}
      displayValue={displayValue}
      icon="clock-outline"
      hasValue={hasValue}
      onOpen={handleOpen}
    >
      <NativeDateOrTimePicker
        mode="time"
        visible={isPickerVisible}
        value={pickerValue}
        onChange={handlePick}
        onClose={closePicker}
      />
    </PickerInputField>
  );
};
