import { isBlank } from '@lichens-innovation/ts-common';
import { mapEnumOptions } from '@lichens-innovation/ts-common/rjsf';
import type { WidgetProps } from '@rjsf/utils';
import { useMemo, type FunctionComponent } from 'react';
import { View } from 'react-native';
import { DropDownMultiSelector } from '../../../components/drop-down-selector/drop-down-multi-selector';
import { useDropDownWidgetProps } from './shared/use-drop-down-widget-props';

const PLACEHOLDER_FALLBACK = '...';

const resolvePlaceholder = ({ options, placeholder }: Pick<WidgetProps, 'options' | 'placeholder'>): string => {
  const candidates: unknown[] = [options?.placeholder, options?.['ui:placeholder'], placeholder];
  const placeholderFound = candidates.find(
    (candidate): candidate is string => typeof candidate === 'string' && !isBlank(candidate)
  );
  return placeholderFound ?? PLACEHOLDER_FALLBACK;
};

export const MultiSelectWidget: FunctionComponent<WidgetProps> = (props) => {
  const { value, options } = props;
  const { blockStyle, dropDownProps } = useDropDownWidgetProps(props);
  const selectOptions = useMemo(() => mapEnumOptions(options), [options]);
  const selectedCodes = useMemo(() => (Array.isArray(value) ? value.map(String) : []), [value]);

  return (
    <View style={blockStyle}>
      <DropDownMultiSelector
        {...dropDownProps}
        value={selectedCodes}
        options={selectOptions}
        placeholder={resolvePlaceholder(props)}
      />
    </View>
  );
};
