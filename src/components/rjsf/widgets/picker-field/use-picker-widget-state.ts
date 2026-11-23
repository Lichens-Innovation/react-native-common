import { type DisplayLocale, isNullish, toDisplayLocale } from '@lichens-innovation/ts-common';
import type { WidgetProps } from '@rjsf/utils';
import { useToggle } from '@uidotdev/usehooks';
import { useTranslation } from 'react-i18next';
import { useCommitWidgetValue } from '../shared/use-commit-widget-value';

export interface PickerValueFormat {
  parse: (value?: string) => Date | null;
  formatForDisplay: (value?: string, locale?: DisplayLocale) => string;
  serialize: (picked: Date) => string;
}

export const usePickerWidgetState = (props: WidgetProps, { parse, formatForDisplay, serialize }: PickerValueFormat) => {
  const { value } = props;
  const { i18n } = useTranslation();
  const commitValue = useCommitWidgetValue(props);
  const [isPickerVisible, togglePickerVisibility] = useToggle(false);
  const parsedValue = parse(value as string);

  return {
    pickerValue: parsedValue ?? new Date(),
    hasValue: !isNullish(parsedValue),
    displayValue: formatForDisplay(value as string, toDisplayLocale(i18n.language)),
    isPickerVisible,
    togglePickerVisibility,
    closePicker: () => togglePickerVisibility(false),
    commitPicked: (picked: Date) => commitValue(serialize(picked)),
  };
};
