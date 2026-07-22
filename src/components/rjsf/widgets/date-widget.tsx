import { isNullish } from '@lichens-innovation/ts-common';
import DateTimePicker from '@react-native-community/datetimepicker';
import type { WidgetProps } from '@rjsf/utils';
import { useToggle } from '@uidotdev/usehooks';
import type { FunctionComponent } from 'react';
import { Platform, Pressable, StyleSheet, View } from 'react-native';
import { IconButton, TextInput } from 'react-native-paper';
import { useAppTheme, useIsDarkMode } from '../../../theme';
import { mergeLabelColorTheme } from '../label-color-theme';

import {
  dateToDateOnlyString,
  formatDateOnlyForDisplay,
  getRjsfDisplayLabel,
  getRjsfLabelColor,
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
  options,
}) => {
  const theme = useAppTheme();
  const isDarkMode = useIsDarkMode();
  const styles = useStyles();
  const [showPicker, togglePickerVisibility] = useToggle(false);
  const hasError = hasRjsfErrors(rawErrors);
  const displayLabel = getRjsfDisplayLabel({ label, required, hideLabel });
  const labelColorTheme = mergeLabelColorTheme(theme, getRjsfLabelColor(options));
  const parsedDate = parseDateOnlyToLocalDate(value as string);
  const date = parsedDate ?? new Date();
  const hasValue = !isNullish(parsedDate);
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
          theme={labelColorTheme}
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

  // On iOS the spinner only fires onChange when the user scrolls to a different
  // value, so opening on an empty field would leave it empty. Commit the default
  // (current) date immediately so the shown value is actually entered.
  const handleOpen = () => {
    if (!showPicker && !hasValue) {
      const dateOnly = dateToDateOnlyString(date);
      onChange(dateOnly);
      onBlur(id, dateOnly);
    }
    togglePickerVisibility();
  };

  const handleClear = () => {
    onChange(undefined);
    onBlur(id, undefined);
  };

  return (
    <View style={styles.widgetBlock}>
      <Pressable onPress={handleOpen}>
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
          theme={labelColorTheme}
          right={hasValue ? undefined : <TextInput.Icon icon="calendar" />}
          onFocus={() => onFocus(id, value)}
          pointerEvents="none"
        />
      </Pressable>

      {hasValue && (
        <IconButton icon="close" size={20} onPress={handleClear} style={styles.clearButton} />
      )}

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
    clearButton: {
      position: 'absolute',
      right: theme.spacing(0.5),
      top: theme.spacing(1.5),
    },
  });
};
