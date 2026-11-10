import { getRjsfTextChangeValue, toStringOrEmpty } from '@lichens-innovation/ts-common/rjsf';
import type { WidgetProps } from '@rjsf/utils';
import { useCallback } from 'react';
import { useOutlinedInputProps } from './use-outlined-input-props';

export const useTextEntryProps = (widgetProps: WidgetProps) => {
  const { id, value, readonly, onChange, onBlur, onFocus, options } = widgetProps;
  const outlinedInputProps = useOutlinedInputProps(widgetProps);
  const emptyValue: unknown = options?.emptyValue;

  const changeText = useCallback(
    (text: string) => {
      onChange(getRjsfTextChangeValue({ text, emptyValue }));
    },
    [onChange, emptyValue]
  );

  return {
    inputProps: {
      ...outlinedInputProps,
      value: toStringOrEmpty(value),
      editable: !readonly,
      onBlur: () => onBlur(id, value),
      onFocus: () => onFocus(id, value),
    },
    changeText,
  };
};
