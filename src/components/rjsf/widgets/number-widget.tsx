import { isBlank } from '@lichens-innovation/ts-common';
import { getRjsfDisplayLabel, hasRjsfErrors, toStringOrEmpty } from '@lichens-innovation/ts-common/rjsf';
import type { WidgetProps } from '@rjsf/utils';
import { useEffect, useRef, useState, type FunctionComponent } from 'react';
import { StyleSheet } from 'react-native';
import { TextInput } from 'react-native-paper';
import { logger } from '../../../logger/logger';
import { useAppTheme } from '../../../theme';

// Reject keystrokes that would produce an invalid number-in-progress, so a
// valid intermediate state ("1.", "-", "") is allowed but "1.2.3" is not.
// Both "." and "," accepted — FR iOS decimal-pad emits ",".
const INTEGER_PATTERN = /^-?\d*$/;
const FLOAT_PATTERN = /^-?\d*[.,]?\d*$/;

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
  const externalStr = toStringOrEmpty(value);
  const isInteger = schema?.type === 'integer';

  const [localText, setLocalText] = useState(externalStr);
  const isFocusedRef = useRef(false);

  // Sync from external value only when not actively editing — keeps trailing
  // separators like "1." visible while user is mid-type.
  useEffect(() => {
    if (isFocusedRef.current) return;
    setLocalText(externalStr);
  }, [externalStr]);

  const validPattern = isInteger ? INTEGER_PATTERN : FLOAT_PATTERN;

  const handleChangeText = (text: string) => {
    if (!validPattern.test(text)) return;
    setLocalText(text);

    if (isBlank(text)) {
      onChange(options?.emptyValue);
      return;
    }

    const floatValue = parseFloat(text.replace(',', '.'));
    if (Number.isNaN(floatValue)) {
      logger.error('[NumberWidget]: parseFloat returned NaN for regex-valid text', { text });
      return;
    }
    onChange(isInteger ? Math.round(floatValue) : floatValue);
  };

  const keyboardType = isInteger ? 'number-pad' : 'decimal-pad';
  const inputMode = isInteger ? 'numeric' : 'decimal';

  const unit = options?.unit as string | undefined;

  return (
    <TextInput
      mode="outlined"
      label={displayLabel}
      value={localText}
      placeholder={placeholder}
      disabled={disabled}
      editable={!readonly}
      keyboardType={keyboardType}
      inputMode={inputMode}
      onChangeText={handleChangeText}
      onBlur={() => {
        isFocusedRef.current = false;
        onBlur(id, value);
      }}
      onFocus={() => {
        isFocusedRef.current = true;
        onFocus(id, value);
      }}
      error={hasError}
      style={styles.input}
      outlineColor={theme.colors.outline}
      right={unit ? <TextInput.Affix text={unit} /> : undefined}
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
