import {
  getRjsfDisplayLabel,
  getRjsfTextChangeValue,
  hasRjsfErrors,
  toStringOrEmpty,
} from '@lichens-innovation/ts-common/rjsf';
import type { WidgetProps } from '@rjsf/utils';
import type { FunctionComponent } from 'react';
import { StyleSheet } from 'react-native';
import { PasswordInput } from '~/components/password-input/password-input';
import { useAppTheme } from '~/theme';

export const PasswordWidget: FunctionComponent<WidgetProps> = ({
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

  const handleChangeText = (text: string) => {
    onChange(getRjsfTextChangeValue({ text, emptyValue: options?.emptyValue }));
  };

  return (
    <PasswordInput
      mode="outlined"
      label={displayLabel}
      value={toStringOrEmpty(value)}
      placeholder={placeholder}
      disabled={disabled}
      editable={!readonly}
      onChangeText={handleChangeText}
      onBlur={() => onBlur(id, value)}
      onFocus={() => onFocus(id, value)}
      error={hasError}
      style={styles.input}
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
  });
};
