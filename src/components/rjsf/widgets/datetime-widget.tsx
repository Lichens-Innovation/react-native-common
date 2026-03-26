import { isNullish } from '@lichens-innovation/ts-common';
import DateTimePicker from '@react-native-community/datetimepicker';
import type { WidgetProps } from '@rjsf/utils';
import { useToggle } from '@uidotdev/usehooks';
import type { FunctionComponent } from 'react';
import { Platform, Pressable, StyleSheet, View } from 'react-native';
import { TextInput } from 'react-native-paper';
import { useAppTheme, useIsDarkMode } from '../../../theme';

import {
  formatDateTimeForDisplay,
  getRjsfDisplayLabel,
  hasRjsfErrors,
  parseDateOrNull,
} from '@lichens-innovation/ts-common/rjsf';

export const DateTimeWidget: FunctionComponent<WidgetProps> = ({
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
  const date = parseDateOrNull(value as string) ?? new Date();
  const strValue = formatDateTimeForDisplay(value as string);
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
      const iso = selectedDate.toISOString();
      onChange(iso);
      onBlur(id, iso);
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
          right={<TextInput.Icon icon="clock-outline" onPress={() => togglePickerVisibility()} />}
          onFocus={() => onFocus(id, value)}
          pointerEvents="none"
        />
      </Pressable>
      {showPicker && (
        <DateTimePicker
          value={date}
          mode="datetime"
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
