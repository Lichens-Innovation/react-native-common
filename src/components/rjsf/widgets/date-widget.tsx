import { isNullish } from '@lichens-innovation/ts-common';
import DateTimePicker from '@react-native-community/datetimepicker';
import type { WidgetProps } from '@rjsf/utils';
import { useToggle } from '@uidotdev/usehooks';
import type { FunctionComponent } from 'react';
import { Platform, Pressable, StyleSheet, View } from 'react-native';
import { TextInput } from 'react-native-paper';
import { useAppTheme, useIsDarkMode } from '~/theme';

import {
  dateToDateOnlyString,
  formatDateOnlyForDisplay,
  getRjsfDisplayLabel,
  hasRjsfErrors,
  parseDateOnlyToLocalDate,
} from '@lichens-innovation/ts-common/rjsf';

export const DateWidget: FunctionComponent<WidgetProps> = ({
  id,
  value,
  disabled,
  readonly,
  placeholder,
  onChange,
  onBlur,
  onFocus,
  label,
  hideLabel,
  required,
  rawErrors,
}) => {
  const theme = useAppTheme();
  const isDarkMode = useIsDarkMode();
  const styles = useStyles();
  const [showPicker, togglePickerVisibility] = useToggle(false);
  const hasError = hasRjsfErrors(rawErrors);
  const displayLabel = getRjsfDisplayLabel({ label, required, hideLabel });
  const date = parseDateOnlyToLocalDate(value as string) ?? new Date();
  const strValue = formatDateOnlyForDisplay(value as string);
  const pickerDisplay = Platform.OS === 'ios' ? 'spinner' : 'default';
  const themeVariant = isDarkMode ? 'dark' : 'light';
  const isDisplayOnly = disabled || readonly;

  if (isDisplayOnly) {
    return (
      <View style={styles.widgetBlock}>
        <TextInput
          mode="outlined"
          label={displayLabel}
          value={strValue}
          placeholder={placeholder}
          disabled={disabled}
          editable={false}
          error={hasError}
          style={styles.input}
          outlineColor={theme.colors.outline}
          onFocus={() => onFocus(id, value)}
          pointerEvents="auto"
        />
      </View>
    );
  }

  const handlePick = (_: unknown, selectedDate?: Date) => {
    if (Platform.OS === 'android') togglePickerVisibility(false);
    if (!isNullish(selectedDate)) {
      const dateOnly = dateToDateOnlyString(selectedDate);
      onChange(dateOnly);
      onBlur(id, dateOnly);
    }
  };

  return (
    <View style={styles.widgetBlock}>
      <Pressable onPress={() => togglePickerVisibility()}>
        <TextInput
          mode="outlined"
          label={displayLabel}
          value={strValue}
          placeholder={placeholder}
          disabled={disabled}
          editable={false}
          error={hasError}
          style={styles.input}
          outlineColor={theme.colors.outline}
          right={<TextInput.Icon icon="calendar" onPress={() => togglePickerVisibility()} />}
          onFocus={() => onFocus(id, value)}
          pointerEvents="none"
        />
      </Pressable>

      {showPicker && (
        <DateTimePicker
          value={date}
          mode="date"
          display={pickerDisplay}
          onChange={handlePick}
          onTouchCancel={() => togglePickerVisibility(false)}
          themeVariant={themeVariant}
          {...(Platform.OS === 'ios' && { textColor: theme.colors.onSurface })}
        />
      )}
    </View>
  );
};

const useStyles = () => {
  const theme = useAppTheme();
  return StyleSheet.create({
    widgetBlock: {
      marginVertical: theme.spacing(0.5),
    },
    input: {
      marginVertical: theme.spacing(0.5),
    },
  });
};
