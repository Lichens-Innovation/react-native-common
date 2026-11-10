import { mapEnumOptions, toStringOrUndefined } from '@lichens-innovation/ts-common/rjsf';
import type { WidgetProps } from '@rjsf/utils';
import { useMemo, type FunctionComponent } from 'react';
import { View } from 'react-native';
import { DropDownSelector } from '../../../components/drop-down-selector/drop-down-selector';
import { useDropDownWidgetProps } from './shared/use-drop-down-widget-props';

export const SelectWidget: FunctionComponent<WidgetProps> = (props) => {
  const { value, placeholder, options } = props;
  const { blockStyle, dropDownProps } = useDropDownWidgetProps(props);
  const selectOptions = useMemo(() => mapEnumOptions(options), [options]);

  return (
    <View style={blockStyle}>
      <DropDownSelector
        {...dropDownProps}
        value={toStringOrUndefined(value)}
        options={selectOptions}
        placeholder={placeholder}
      />
    </View>
  );
};
