import { isBlank } from '@lichens-innovation/ts-common';
import { getRjsfDisplayLabel, hasRjsfErrors, toStringOrEmpty } from '@lichens-innovation/ts-common/rjsf';
import type { WidgetProps } from '@rjsf/utils';
import type { FunctionComponent } from 'react';
import { StyleSheet } from 'react-native';
import { TextInput } from 'react-native-paper';
import { logger } from '../../../logger/logger';
import { useAppTheme } from '../../../theme';

export const NumberWidget: FunctionComponent<WidgetProps> = ({
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
  schema,
}) => {
  const theme = useAppTheme();
  const styles = useStyles();
  const hasError = hasRjsfErrors(rawErrors);
  const displayLabel = getRjsfDisplayLabel({ label, required, hideLabel });
  const strValue = toStringOrEmpty(value);

  const isInteger = schema?.type === 'integer';

  const handleChangeText = (text: string) => {
    if (isBlank(text)) {
      onChange(options?.emptyValue);
      return;
    }

    const floatValue = parseFloat(text);
    if (Number.isNaN(floatValue)) {
      logger.error('[NumberWidget]: Invalid float value', { text });
      return;
    }
    onChange(isInteger ? Math.round(floatValue) : floatValue);
  };

  const keyboardType = isInteger ? 'number-pad' : 'decimal-pad';
  const inputMode = isInteger ? 'numeric' : 'decimal';

  return (
    <TextInput
      mode="outlined"
      label={displayLabel}
      value={strValue}
      placeholder={placeholder}
      disabled={disabled}
      editable={!readonly}
      keyboardType={keyboardType}
      inputMode={inputMode}
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
