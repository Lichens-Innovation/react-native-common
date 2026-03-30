import {
  getRjsfDisplayLabel,
  getRjsfTextChangeValue,
  hasRjsfErrors,
  toStringOrEmpty,
} from '@lichens-innovation/ts-common/rjsf';
import type { WidgetProps } from '@rjsf/utils';
import type { FunctionComponent } from 'react';
import { StyleSheet } from 'react-native';
import { RecordingTextInputArgs, VoiceRecognitionTextInput } from '../../../components/voice-recognition';
import { useAppTheme } from '../../../theme';

export const TextareaWidget: FunctionComponent<WidgetProps> = ({
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
  const numberOfLines = options?.numberOfLines ?? 4;

  const handleValueChange = ({ value }: RecordingTextInputArgs) => {
    onChange(getRjsfTextChangeValue({ text: value, emptyValue: options?.emptyValue }));
  };

  return (
    <VoiceRecognitionTextInput
      mode="outlined"
      label={displayLabel}
      value={toStringOrEmpty(value)}
      placeholder={placeholder}
      disabled={disabled}
      editable={!readonly}
      multiline
      numberOfLines={numberOfLines}
      onValueChange={handleValueChange}
      onBlur={() => onBlur(id, value)}
      onFocus={() => onFocus(id, value)}
      error={hasError}
      style={[styles.input, styles.textarea]}
      outlineColor={theme.colors.outline}
    />
  );
};

const useStyles = () => {
  const theme = useAppTheme();
  return StyleSheet.create({
    input: {
      marginVertical: theme.spacing(0.5),
    },
    textarea: {
      minHeight: 100,
    },
  });
};
