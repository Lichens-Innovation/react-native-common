import DateTimePicker, { type DateTimePickerEvent } from '@react-native-community/datetimepicker';
import type { FunctionComponent } from 'react';
import { Platform } from 'react-native';
import { IosPickerModal } from './ios-picker-modal';
import { usePickerThemeVariant } from './use-picker-theme-variant';

interface NativeDateOrTimePickerProps {
  mode: 'date' | 'time';
  visible: boolean;
  value: Date;
  onChange: (event: DateTimePickerEvent, selected?: Date) => void;
  onClose: () => void;
}

/** habit-hooks-disable non-essential-comment
 * The platform picker for a single native mode: an iOS spinner in a modal, or Android's one-shot dialog,
 * which closes itself on any answer before reporting it.
 */
export const NativeDateOrTimePicker: FunctionComponent<NativeDateOrTimePickerProps> = ({
  mode,
  visible,
  value,
  onChange,
  onClose,
}) => {
  const themeVariant = usePickerThemeVariant();

  if (Platform.OS === 'ios') {
    return <IosPickerModal visible={visible} value={value} mode={mode} onChange={onChange} onClose={onClose} />;
  }

  if (!visible) {
    return null;
  }

  const handleAndroidChange = (event: DateTimePickerEvent, selected?: Date) => {
    onClose();
    onChange(event, selected);
  };

  // `is24Hour` only shapes the Android time dialog; the STORED value is always 24-hour HH:MM:00. habit-hooks-disable non-essential-comment
  return (
    <DateTimePicker
      value={value}
      mode={mode}
      display="default"
      is24Hour={mode === 'time'}
      onChange={handleAndroidChange}
      onTouchCancel={onClose}
      themeVariant={themeVariant}
    />
  );
};
