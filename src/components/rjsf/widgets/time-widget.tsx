import { isNullish } from '@lichens-innovation/ts-common';
import {
  formatTimeOnlyForDisplay,
  parseTimeOnlyToLocalDate,
  timeToTimeOnlyString,
} from '@lichens-innovation/ts-common/rjsf';
import DateTimePicker, { type DateTimePickerEvent } from '@react-native-community/datetimepicker';
import type { WidgetProps } from '@rjsf/utils';
import type { FunctionComponent } from 'react';
import { Platform } from 'react-native';
import { IosPickerModal } from './picker-field/ios-picker-modal';
import { PickerInputField } from './picker-field/picker-input-field';
import { usePickerThemeVariant } from './picker-field/use-picker-theme-variant';
import { usePickerWidgetState } from './picker-field/use-picker-widget-state';
import { useCommitWidgetValue } from './shared/use-commit-widget-value';

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
  const { value } = props;
  const themeVariant = usePickerThemeVariant();
  const commitValue = useCommitWidgetValue(props);
  const { pickerValue, hasValue, displayValue, isPickerVisible, togglePickerVisibility, closePicker } =
    usePickerWidgetState({
      value,
      parse: parseTimeOnlyToLocalDate,
      formatForDisplay: formatTimeOnlyForDisplay,
    });

  const commitTime = (picked: Date) => commitValue(timeToTimeOnlyString(picked));

  const handlePick = (event: DateTimePickerEvent, selectedTime?: Date) => {
    if (Platform.OS === 'android') closePicker();
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
      {Platform.OS === 'ios' ? (
        <IosPickerModal
          visible={isPickerVisible}
          value={pickerValue}
          mode="time"
          onChange={handlePick}
          onClose={closePicker}
        />
      ) : (
        isPickerVisible && (
          // `is24Hour` only shapes the Android dialog; the STORED value is always 24-hour HH:MM:00. habit-hooks-disable non-essential-comment
          <DateTimePicker
            value={pickerValue}
            mode="time"
            display="default"
            is24Hour
            onChange={handlePick}
            themeVariant={themeVariant}
          />
        )
      )}
    </PickerInputField>
  );
};
