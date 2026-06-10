import {
  getRjsfDisplayLabel,
  getRjsfLabelColor,
  getRjsfTextChangeValue,
  hasRjsfErrors,
  toStringOrEmpty,
} from '@lichens-innovation/ts-common/rjsf';
import type { WidgetProps } from '@rjsf/utils';
import { useCallback, useMemo, type FunctionComponent } from 'react';
import { StyleSheet } from 'react-native';
import { type RecordingTextInputArgs, VoiceRecognitionTextInput } from '../../../components/voice-recognition';
import { useAppTheme } from '../../../theme';
import { mergeLabelColorTheme } from '../label-color-theme';

export const TextWidget: FunctionComponent<WidgetProps> = ({
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
  const styles = useStyles();
  const hasError = hasRjsfErrors(rawErrors);
  const displayLabel = getRjsfDisplayLabel({ label, required, hideLabel });
  const labelColorTheme = mergeLabelColorTheme(theme, getRjsfLabelColor(options));

  const handleValueChange = useCallback(
    ({ value }: RecordingTextInputArgs) => {
      onChange(getRjsfTextChangeValue({ text: value, emptyValue: options?.emptyValue }));
    },
    [onChange, options?.emptyValue]
  );

  return (
    <VoiceRecognitionTextInput
      mode="outlined"
      label={displayLabel}
      value={toStringOrEmpty(value)}
      placeholder={placeholder}
      disabled={disabled}
      editable={!readonly}
      onValueChange={handleValueChange}
      onBlur={() => onBlur(id, value)}
      onFocus={() => onFocus(id, value)}
      error={hasError}
      style={styles.input}
      outlineColor={theme.colors.outline}
      theme={labelColorTheme}
    />
  );
};

const useStyles = () => {
  const theme = useAppTheme();
  return useMemo(
    () =>
      StyleSheet.create({
        input: {
          marginVertical: theme.spacing(0.5),
        },
      }),
    [theme]
  );
};
