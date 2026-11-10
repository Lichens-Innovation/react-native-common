import { isBlank } from '@lichens-innovation/ts-common';
import { toStringOrEmpty } from '@lichens-innovation/ts-common/rjsf';
import { DEFAULT_ID_PREFIX, DEFAULT_ID_SEPARATOR, type WidgetProps } from '@rjsf/utils';
import { useEffect, useRef, useState, type FunctionComponent } from 'react';
import { Platform } from 'react-native';
import { TextInput } from 'react-native-paper';
import { logger } from '../../../logger/logger';
import { useRootFormDataStore } from '../root-form-data-context';
import { useOutlinedInputProps } from './shared/use-outlined-input-props';

/** habit-hooks-disable non-essential-comment
 * Reject keystrokes that would produce an invalid number-in-progress, so a valid intermediate state
 * ("1.", "-", "") is allowed but "1.2.3" is not. Both "." and "," accepted — FR iOS decimal-pad emits ",".
 */
const INTEGER_PATTERN = /^-?\d*$/;
const FLOAT_PATTERN = /^-?\d*[.,]?\d*$/;

export const NumberWidget: FunctionComponent<WidgetProps> = (props) => {
  const { id, name, value, readonly, onChange, onBlur, onFocus, options, registry, schema } = props;
  const outlinedInputProps = useOutlinedInputProps(props);
  const externalStr = toStringOrEmpty(value);
  const isInteger = schema?.type === 'integer';

  const [localText, setLocalText] = useState(externalStr);
  const isFocusedRef = useRef(false);

  /* habit-hooks-disable non-essential-comment
   * A ComputedField reading this value repaints in the keystroke's own frame instead of waiting for
   * rjsf's change cycle, whose cost is a whole-schema state derivation and grows with the form
   * (SPOTD-621). rjsf still receives the same onChange, unchanged, and remains the authority.
   *
   * Top-level fields only: formulas resolve top-level slugs, and `name` alone is not unique — a
   * nested `foo` carries the same `name` as a top-level `foo`, whereas `id` is the full path.
   */
  const store = useRootFormDataStore();
  // Optional chaining: a widget rendered outside a Form (a unit test with a hand-built registry) still has to work. habit-hooks-disable non-essential-comment
  const idPrefix = registry?.globalFormOptions?.idPrefix ?? DEFAULT_ID_PREFIX;
  const idSeparator = registry?.globalFormOptions?.idSeparator ?? DEFAULT_ID_SEPARATOR;
  const isTopLevelField = id === [idPrefix, name].join(idSeparator);

  const publishLive = (nextValue: unknown) => {
    if (!isTopLevelField) return;
    store.setLiveValue(id, name, nextValue);
  };

  /* habit-hooks-disable non-essential-comment
   * Hand the field back to rjsf when it is no longer being typed into, or when a conditional branch
   * takes it out of the form. Without this, a value rjsf overruled rather than accepted — a cleared
   * leaf, a sanitized leaf, an if/then reset — would shadow the real form data for as long as the form
   * stayed mounted, since such an entry can never match on convergence.
   *
   * The trade: blurring before rjsf has converged shows the previously committed value for one cycle.
   * That is a stale-by-one-commit number rather than a wrong-forever one, and it self-corrects.
   */
  useEffect(() => {
    if (!isTopLevelField) return;

    return () => {
      store.clearLiveValue(id);
    };
  }, [store, id, isTopLevelField]);

  // Skipped while focused so trailing separators like "1." stay visible mid-type. habit-hooks-disable non-essential-comment
  useEffect(() => {
    if (isFocusedRef.current) return;
    setLocalText(externalStr);
  }, [externalStr]);

  const validPattern = isInteger ? INTEGER_PATTERN : FLOAT_PATTERN;

  const handleChangeText = (text: string) => {
    if (!validPattern.test(text)) return;
    setLocalText(text);

    // Digitless intermediates ("-", ".", ",") are regex-valid but unparseable: treat as empty, keep the text. habit-hooks-disable non-essential-comment
    if (isBlank(text) || !/\d/.test(text)) {
      publishLive(options?.emptyValue);
      onChange(options?.emptyValue);
      return;
    }

    const floatValue = parseFloat(text.replace(',', '.'));
    if (Number.isNaN(floatValue)) {
      logger.error('[NumberWidget]: parseFloat returned NaN for regex-valid text', { text });
      return;
    }
    const nextValue = isInteger ? Math.round(floatValue) : floatValue;
    publishLive(nextValue);
    onChange(nextValue);
  };

  /* habit-hooks-disable non-essential-comment
   * Default numeric keyboards lack a minus key, so negatives can't be typed: iOS number-pad / decimal-pad
   * have none, and some Android skins (e.g. Samsung) hide it on number-pad too. Use signed-capable keyboards
   * instead — numbers-and-punctuation on iOS, numeric (FLAG_SIGNED|FLAG_DECIMAL) on Android. inputMode must
   * stay undefined: when set it takes precedence over keyboardType and no inputMode maps to a signed keyboard.
   */
  const keyboardType = Platform.OS === 'ios' ? 'numbers-and-punctuation' : 'numeric';
  const inputMode = undefined;

  const unit = options?.unit as string | undefined;

  return (
    <TextInput
      {...outlinedInputProps}
      value={localText}
      editable={!readonly}
      keyboardType={keyboardType}
      inputMode={inputMode}
      onChangeText={handleChangeText}
      onBlur={() => {
        isFocusedRef.current = false;
        if (isTopLevelField) store.clearLiveValue(id);
        onBlur(id, value);
      }}
      onFocus={() => {
        isFocusedRef.current = true;
        onFocus(id, value);
      }}
      right={unit ? <TextInput.Affix text={unit} /> : undefined}
    />
  );
};
