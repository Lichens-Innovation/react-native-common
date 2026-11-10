import { isNullish } from '@lichens-innovation/ts-common';
import DateTimePicker, { type DateTimePickerEvent } from '@react-native-community/datetimepicker';
import { useState, type FunctionComponent } from 'react';
import { usePickerThemeVariant } from './use-picker-theme-variant';

type AndroidDialogStage = 'date' | 'time';

interface AndroidDateTimeDialogsProps {
  value: Date;
  onConfirm: (picked: Date) => void;
  onClose: () => void;
}

/** habit-hooks-disable non-essential-comment
 * Android has no combined date+time dialog: `mode="datetime"` silently opens the DATE dialog, then the
 * library's unmount cleanup looks the mode up in a map holding only `date` and `time` and crashes on
 * `undefined.dismiss()` (SPOTD-901). So the two dialogs run in sequence and their answers are combined.
 * Nothing is written until the time is confirmed: cancelling either dialog leaves the field untouched.
 */
export const AndroidDateTimeDialogs: FunctionComponent<AndroidDateTimeDialogsProps> = ({
  value,
  onConfirm,
  onClose,
}) => {
  const themeVariant = usePickerThemeVariant();
  const [stage, setStage] = useState<AndroidDialogStage>('date');
  const [pickedDay, setPickedDay] = useState<Date | null>(null);

  const handleDayPick = (event: DateTimePickerEvent, selectedDate?: Date) => {
    if (event.type !== 'set' || isNullish(selectedDate)) {
      onClose();
      return;
    }
    setPickedDay(selectedDate);
    setStage('time');
  };

  const handleTimePick = (event: DateTimePickerEvent, selectedTime?: Date) => {
    onClose();
    if (event.type !== 'set' || isNullish(selectedTime)) return;

    const combined = new Date(pickedDay ?? value);
    combined.setHours(selectedTime.getHours(), selectedTime.getMinutes(), 0, 0);
    onConfirm(combined);
  };

  return (
    // Keyed by stage so the date dialog unmounts (dismissing under its OWN mode) before the time one mounts. habit-hooks-disable non-essential-comment
    <DateTimePicker
      key={stage}
      value={stage === 'time' ? (pickedDay ?? value) : value}
      mode={stage}
      display="default"
      onChange={stage === 'date' ? handleDayPick : handleTimePick}
      themeVariant={themeVariant}
    />
  );
};
