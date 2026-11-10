import { isNullish } from '@lichens-innovation/ts-common';
import { type EnumOptionDisplay, mapEnumOptions } from '@lichens-innovation/ts-common/rjsf';
import type { WidgetProps } from '@rjsf/utils';
import type { FunctionComponent } from 'react';
import { Pressable, StyleSheet, View } from 'react-native';
import { Checkbox, Text } from 'react-native-paper';
import { useAppTheme } from '../../../theme/theme.index';
import { RjsfDisplayLabel } from './display-label';
import { getWidgetTitle } from './shared/widget-title.utils';
import { useCommitWidgetValue } from './shared/use-commit-widget-value';
import { isWidgetDisplayOnly } from './shared/widget-state.utils';

export const CheckboxesWidget: FunctionComponent<WidgetProps> = (props) => {
  const { value, options, schema } = props;
  const styles = useStyles();
  const commitValue = useCommitWidgetValue(props);
  const isDisplayOnly = isWidgetDisplayOnly(props);
  const widgetTitle = getWidgetTitle(props);
  const enumOptions = mapEnumOptions(options);
  const isArrayValue = Array.isArray(value);
  const currentSet = isArrayValue ? value : [];
  const hasMaxItems = typeof schema?.maxItems === 'number';
  const maxItems = hasMaxItems ? schema.maxItems : undefined;

  const toggle = (optValue: string) => {
    if (isDisplayOnly) return;

    const isChecked = currentSet.includes(optValue);
    const next = isChecked ? currentSet.filter((v) => v !== optValue) : [...currentSet, optValue];
    if (!isNullish(maxItems) && next.length > maxItems) return;

    commitValue(Array.from(new Set(next)));
  };

  return (
    <View style={styles.widgetBlock}>
      <RjsfDisplayLabel {...widgetTitle} style={styles.checkboxesTitle} />

      {enumOptions.map((opt: EnumOptionDisplay) => {
        const isOptionChecked = currentSet.includes(opt.value);
        const checkboxStatus = isOptionChecked ? 'checked' : 'unchecked';
        return (
          <View key={opt.value} style={styles.checkboxRow}>
            <Checkbox status={checkboxStatus} onPress={() => toggle(opt.value)} disabled={isDisplayOnly} />
            <Pressable onPress={() => toggle(opt.value)} style={styles.checkboxLabel}>
              <Text variant="bodyLarge">{opt.label}</Text>
            </Pressable>
          </View>
        );
      })}
    </View>
  );
};

const useStyles = () => {
  const theme = useAppTheme();
  return StyleSheet.create({
    widgetBlock: {
      marginVertical: theme.spacing(0.5),
    },
    checkboxesTitle: {
      marginBottom: theme.spacing(1),
    },
    checkboxRow: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: theme.spacing(1),
      marginVertical: theme.spacing(0.5),
    },
    checkboxLabel: {
      flex: 1,
    },
  });
};
