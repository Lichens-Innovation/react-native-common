import { isBlank } from '@lichens-innovation/ts-common';
import { getRjsfDisplayLabel, getRjsfLabelColor, hasRjsfErrors, toStringOrEmpty } from '@lichens-innovation/ts-common/rjsf';
import type { WidgetProps } from '@rjsf/utils';
import { useEffect, useMemo, useRef, useState, type FunctionComponent } from 'react';
import { Platform, StyleSheet } from 'react-native';
import { TextInput } from 'react-native-paper';
import { logger } from '../../../logger/logger';
import { useAppTheme } from '../../../theme';
import { mergeLabelColorTheme } from '../label-color-theme';

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
  const labelColorTheme = mergeLabelColorTheme(theme, getRjsfLabelColor(options));
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

    // Digitless intermediates ("-", ".", ",") are regex-valid mid-type states
    // but don't parse to a number — treat as empty, keep the text visible.
    if (isBlank(text) || !/\d/.test(text)) {
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

  // Default numeric keyboards lack a minus key, so negatives can't be typed:
  // iOS number-pad / decimal-pad have none, and some Android skins (e.g.
  // Samsung) hide it on number-pad too. Use signed-capable keyboards instead —
  // numbers-and-punctuation on iOS, numeric (FLAG_SIGNED|FLAG_DECIMAL) on
  // Android. inputMode must stay undefined: when set it takes precedence over
  // keyboardType and no inputMode maps to a signed numeric keyboard.
  const keyboardType = Platform.OS === 'ios' ? 'numbers-and-punctuation' : 'numeric';
  const inputMode = undefined;

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
      theme={labelColorTheme}
      right={unit ? <TextInput.Affix text={unit} /> : undefined}
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
