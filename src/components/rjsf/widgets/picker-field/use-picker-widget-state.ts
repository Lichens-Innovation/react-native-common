import { type DisplayLocale, isNullish, toDisplayLocale } from '@lichens-innovation/ts-common';
import { useToggle } from '@uidotdev/usehooks';
import { useTranslation } from 'react-i18next';

interface PickerWidgetStateArgs {
  value: unknown;
  parse: (value?: string) => Date | null;
  formatForDisplay: (value?: string, locale?: DisplayLocale) => string;
}

export const usePickerWidgetState = ({ value, parse, formatForDisplay }: PickerWidgetStateArgs) => {
  const { i18n } = useTranslation();
  const [isPickerVisible, togglePickerVisibility] = useToggle(false);
  const parsedValue = parse(value as string);

  return {
    pickerValue: parsedValue ?? new Date(),
    hasValue: !isNullish(parsedValue),
    displayValue: formatForDisplay(value as string, toDisplayLocale(i18n.language)),
    isPickerVisible,
    togglePickerVisibility,
    closePicker: () => togglePickerVisibility(false),
  };
};
