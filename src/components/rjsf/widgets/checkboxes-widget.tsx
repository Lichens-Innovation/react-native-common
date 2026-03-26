import { isNullish } from '@lichens-innovation/ts-common';
import type { EnumOptionDisplay } from '@lichens-innovation/ts-common/rjsf';
import { getRjsfDisplayLabel, mapEnumOptions } from '@lichens-innovation/ts-common/rjsf';
import type { WidgetProps } from '@rjsf/utils';
import type { FunctionComponent } from 'react';
import { Pressable, StyleSheet, View } from 'react-native';
import { Checkbox, Text } from 'react-native-paper';
import { useAppTheme } from '../../../theme';
import { RjsfDisplayLabel } from './display-label';

export const CheckboxesWidget: FunctionComponent<WidgetProps> = ({
  id,
  value,
  disabled,
  readonly,
  onChange,
  onBlur,
  label,
  hideLabel,
  required,
  options,
  schema,
}) => {
  const styles = useStyles();
  const displayLabel = getRjsfDisplayLabel({ label, required, hideLabel });
  const enumOptions = mapEnumOptions(options);
  const isArrayValue = Array.isArray(value);
  const currentSet = isArrayValue ? value : [];
  const hasMaxItems = typeof schema?.maxItems === 'number';
  const maxItems = hasMaxItems ? schema.maxItems : undefined;

  const toggle = (optValue: string) => {
    if (disabled || readonly) return;

    const isChecked = currentSet.includes(optValue);
    const next = isChecked ? currentSet.filter((v) => v !== optValue) : [...currentSet, optValue];
    if (!isNullish(maxItems) && next.length > maxItems) return;

    const unique = Array.from(new Set(next));
    onChange(unique);
    onBlur(id, unique);
  };

  return (
    <View style={styles.widgetBlock}>
      <RjsfDisplayLabel label={displayLabel} style={styles.checkboxesTitle} />

      {enumOptions.map((opt: EnumOptionDisplay) => {
        const isOptionChecked = currentSet.includes(opt.value);
        const checkboxStatus = isOptionChecked ? 'checked' : 'unchecked';
        return (
          <View key={opt.value} style={styles.checkboxRow}>
            <Checkbox status={checkboxStatus} onPress={() => toggle(opt.value)} disabled={disabled || readonly} />
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
