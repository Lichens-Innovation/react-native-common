import { isNullish } from '@lichens-innovation/ts-common';
import DateTimePicker, { type DateTimePickerEvent } from '@react-native-community/datetimepicker';
import type { WidgetProps } from '@rjsf/utils';
import { useToggle } from '@uidotdev/usehooks';
import type { FunctionComponent } from 'react';
import { useTranslation } from 'react-i18next';
import { Modal, Platform, Pressable, StyleSheet, Text, View } from 'react-native';
import { IconButton, TextInput } from 'react-native-paper';
import { useAppTheme, useIsDarkMode } from '../../../theme';
import { mergeLabelColorTheme } from '../label-color-theme';

import {
  formatTimeOnlyForDisplay,
  getRjsfDisplayLabel,
  getRjsfLabelColor,
  hasRjsfErrors,
  parseTimeOnlyToLocalDate,
  timeToTimeOnlyString,
} from '@lichens-innovation/ts-common/rjsf';

/**
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
export const TimeWidget: FunctionComponent<WidgetProps> = ({
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
  const { t } = useTranslation();
  const [showPicker, togglePickerVisibility] = useToggle(false);
  const hasError = hasRjsfErrors(rawErrors);
  const displayLabel = getRjsfDisplayLabel({ label, required, hideLabel });
  const labelColorTheme = mergeLabelColorTheme(theme, getRjsfLabelColor(options));
  const parsedTime = parseTimeOnlyToLocalDate(value as string);
  const time = parsedTime ?? new Date();
  const hasValue = !isNullish(parsedTime);
  const strValue = formatTimeOnlyForDisplay(value as string);
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

  const commit = (picked: Date) => {
    const timeOnly = timeToTimeOnlyString(picked);
    onChange(timeOnly);
    onBlur(id, timeOnly);
  };

  const handlePick = (event: DateTimePickerEvent, selectedTime?: Date) => {
    if (Platform.OS === 'android') togglePickerVisibility(false);
    // Backing out of the Android dialog reports 'dismissed'; writing then would store a time the
    // user never confirmed. iOS commits as the spinner moves, so it only ever reports 'set'.
    if (event.type !== 'set' || isNullish(selectedTime)) return;
    commit(selectedTime);
  };

  // On iOS the spinner only fires onChange when the user scrolls to a different
  // value, so opening on an empty field would leave it empty. Commit the default
  // (current) time immediately so the shown value is actually entered. Android's
  // dialog hands the value back on OK, so it needs no such nudge — and doing it
  // there would leave a time behind when the user cancels out.
  const handleOpen = () => {
    if (Platform.OS !== 'android' && !showPicker && !hasValue) {
      commit(time);
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
          right={hasValue ? undefined : <TextInput.Icon icon="clock-outline" />}
          onFocus={() => onFocus(id, value)}
          pointerEvents="none"
        />
      </Pressable>

      {hasValue && <IconButton icon="close" size={20} onPress={handleClear} style={styles.clearButton} />}

      {Platform.OS === 'ios' ? (
        <Modal visible={showPicker} transparent animationType="slide">
          <Pressable style={styles.backdrop} onPress={() => togglePickerVisibility(false)} />
          <View style={styles.iosContainer}>
            <View style={styles.iosHeader}>
              <Pressable onPress={() => togglePickerVisibility(false)} style={styles.doneButton}>
                <Text style={styles.doneText}>{t('app:general.done')}</Text>
              </Pressable>
            </View>
            <DateTimePicker
              value={time}
              mode="time"
              display="spinner"
              onChange={handlePick}
              themeVariant={themeVariant}
              textColor={theme.colors.onSurface}
            />
          </View>
        </Modal>
      ) : (
        showPicker && (
          // `is24Hour` is honoured on Android only; iOS follows the device locale and ignores it.
          // Either way the STORED value is 24-hour HH:MM:00 — this is the dialog's appearance alone.
          <DateTimePicker
            value={time}
            mode="time"
            display="default"
            is24Hour
            onChange={handlePick}
            themeVariant={themeVariant}
          />
        )
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
    backdrop: {
      flex: 1,
    },
    iosContainer: {
      backgroundColor: theme.colors.surface,
      borderTopLeftRadius: theme.spacing(1.5),
      borderTopRightRadius: theme.spacing(1.5),
    },
    iosHeader: {
      flexDirection: 'row',
      justifyContent: 'flex-end',
      padding: theme.spacing(1.5),
      borderBottomWidth: StyleSheet.hairlineWidth,
      borderBottomColor: theme.colors.outline,
    },
    doneButton: {
      paddingHorizontal: theme.spacing(1),
      paddingVertical: theme.spacing(0.5),
    },
    doneText: {
      fontSize: 16,
      fontWeight: '600',
      color: theme.colors.primary,
    },
  });
};
