import { isNullish } from '@lichens-innovation/ts-common';
import DateTimePicker, { type DateTimePickerEvent } from '@react-native-community/datetimepicker';
import type { WidgetProps } from '@rjsf/utils';
import { useToggle } from '@uidotdev/usehooks';
import { useState, type FunctionComponent } from 'react';
import { useTranslation } from 'react-i18next';
import { Modal, Platform, Pressable, StyleSheet, Text, View } from 'react-native';
import { IconButton, TextInput } from 'react-native-paper';
import { useAppTheme, useIsDarkMode } from '../../../theme';
import { mergeLabelColorTheme } from '../label-color-theme';

import {
  formatDateTimeForDisplay,
  getRjsfDisplayLabel,
  getRjsfLabelColor,
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
  options,
}) => {
  const theme = useAppTheme();
  const isDarkMode = useIsDarkMode();
  const styles = useStyles();
  const { t } = useTranslation();
  const [showPicker, togglePickerVisibility] = useToggle(false);
  // Android has no combined date+time dialog. `mode="datetime"` is an iOS-only mode: asking for it
  // on Android silently opens the DATE dialog, and then the library's unmount cleanup looks the mode
  // up in a map holding only `date` and `time` and crashes on `undefined.dismiss()` (SPOTD-901). So
  // Android runs the two dialogs in sequence and combines the answers. `androidStage` is the dialog
  // currently on screen, `androidDate` the day chosen in the first one.
  const [androidStage, setAndroidStage] = useState<'date' | 'time' | null>(null);
  const [androidDate, setAndroidDate] = useState<Date | null>(null);
  const hasError = hasRjsfErrors(rawErrors);
  const displayLabel = getRjsfDisplayLabel({ label, required, hideLabel });
  const labelColorTheme = mergeLabelColorTheme(theme, getRjsfLabelColor(options));
  const parsedDate = parseDateOrNull(value as string);
  const date = parsedDate ?? new Date();
  const hasValue = !isNullish(parsedDate);
  const strValue = formatDateTimeForDisplay(value as string);
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
    const iso = picked.toISOString();
    onChange(iso);
    onBlur(id, iso);
  };

  const handlePick = (_: unknown, selectedDate?: Date) => {
    if (!isNullish(selectedDate)) {
      commit(selectedDate);
    }
  };

  /** First Android dialog: the day. Anything but a confirmed pick ends the sequence. */
  const handleAndroidDatePick = (event: DateTimePickerEvent, selectedDate?: Date) => {
    if (event.type !== 'set' || isNullish(selectedDate)) {
      setAndroidStage(null);
      return;
    }
    setAndroidDate(selectedDate);
    setAndroidStage('time');
  };

  /**
   * Second Android dialog: the time of the day already chosen. Nothing is written until this one is
   * confirmed — cancelling here leaves the field exactly as it was, rather than storing a day at an
   * hour the user never picked.
   */
  const handleAndroidTimePick = (event: DateTimePickerEvent, selectedTime?: Date) => {
    setAndroidStage(null);
    if (event.type !== 'set' || isNullish(selectedTime)) return;

    const combined = new Date(androidDate ?? date);
    combined.setHours(selectedTime.getHours(), selectedTime.getMinutes(), 0, 0);
    commit(combined);
  };

  const handleOpen = () => {
    if (Platform.OS === 'android') {
      setAndroidDate(null);
      setAndroidStage('date');
      return;
    }

    // On iOS the spinner only fires onChange when the user scrolls to a different
    // value, so opening on an empty field would leave it empty. Commit the default
    // (current) date immediately so the shown value is actually entered. Android needs
    // no such nudge — its dialogs hand back the value on OK — and doing it there would
    // leave a timestamp behind when the user backs out of the two-dialog sequence.
    if (!showPicker && !hasValue) {
      commit(date);
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
              value={date}
              mode="datetime"
              display="spinner"
              onChange={handlePick}
              themeVariant={themeVariant}
              textColor={theme.colors.onSurface}
            />
          </View>
        </Modal>
      ) : (
        androidStage !== null && (
          // Keyed by stage so the first dialog unmounts — and so dismisses under its OWN mode —
          // before the second mounts. The library's cleanup dismisses whatever mode it was last
          // rendered with, which is the whole reason a single `mode="datetime"` crashed here.
          <DateTimePicker
            key={androidStage}
            value={androidStage === 'time' ? (androidDate ?? date) : date}
            mode={androidStage}
            display="default"
            onChange={androidStage === 'date' ? handleAndroidDatePick : handleAndroidTimePick}
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
