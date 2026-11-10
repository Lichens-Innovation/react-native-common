import { type EnumOptionDisplay, mapEnumOptions } from '@lichens-innovation/ts-common/rjsf';
import type { WidgetProps } from '@rjsf/utils';
import type { FunctionComponent } from 'react';
import { StyleSheet, View } from 'react-native';
import { useAppTheme } from '../../../theme/theme.index';
import { RjsfDisplayLabel } from './display-label';
import { getWidgetTitle } from './shared/widget-title.utils';
import { RadioYesNoOption } from './radio-yes-no-option';
import { useCommitWidgetValue } from './shared/use-commit-widget-value';
import { isWidgetDisplayOnly } from './shared/widget-state.utils';

interface YesNoWidgetOptions {
  yesColor?: string;
  noColor?: string;
}

/** habit-hooks-disable non-essential-comment
 * Any value other than the yes/no option values renders as no selection. Add a "" enum option to offer an
 * explicit "no answer"; otherwise the first option is selected by default.
 */
export const RadioYesNoWidget: FunctionComponent<WidgetProps> = (props) => {
  const { value, options } = props;
  const styles = useStyles();
  const commitValue = useCommitWidgetValue(props);
  const isDisplayOnly = isWidgetDisplayOnly(props);
  const widgetTitle = getWidgetTitle(props);
  const enumOptions = mapEnumOptions(options);
  const widgetOptions = (options ?? {}) as YesNoWidgetOptions;

  const yesOption = enumOptions.find((opt: EnumOptionDisplay) => opt.value === 'yes') ?? enumOptions[0];
  const noOption = enumOptions.find((opt: EnumOptionDisplay) => opt.value === 'no') ?? enumOptions[1];

  const currentValue = typeof value === 'string' && value.length > 0 ? value : undefined;

  const handleSelect = (nextValue: string) => {
    if (isDisplayOnly) return;
    commitValue(nextValue);
  };

  return (
    <View style={styles.widgetBlock}>
      <RjsfDisplayLabel {...widgetTitle} style={styles.title} />

      <View style={styles.row}>
        {!!yesOption && (
          <RadioYesNoOption
            option={yesOption}
            isChecked={currentValue === yesOption.value}
            disabled={isDisplayOnly}
            labelColor={widgetOptions.yesColor}
            onSelect={handleSelect}
          />
        )}

        {!!noOption && (
          <RadioYesNoOption
            option={noOption}
            isChecked={currentValue === noOption.value}
            disabled={isDisplayOnly}
            labelColor={widgetOptions.noColor}
            onSelect={handleSelect}
          />
        )}
      </View>
    </View>
  );
};

const useStyles = () => {
  const theme = useAppTheme();

  return StyleSheet.create({
    widgetBlock: {
      marginVertical: theme.spacing(0.5),
    },
    title: {
      marginBottom: theme.spacing(1),
      flexWrap: 'wrap',
    },
    row: {
      flexDirection: 'row',
      justifyContent: 'flex-end',
      alignItems: 'center',
      gap: theme.spacing(2),
    },
  });
};
