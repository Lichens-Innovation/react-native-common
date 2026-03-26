import type { EnumOptionDisplay } from '@lichens-innovation/ts-common/rjsf';
import { getRjsfDisplayLabel, mapEnumOptions } from '@lichens-innovation/ts-common/rjsf';
import type { WidgetProps } from '@rjsf/utils';
import type { FunctionComponent } from 'react';
import { Pressable, StyleSheet, View } from 'react-native';
import { RadioButton, Text } from 'react-native-paper';
import { useAppTheme } from '../../../theme';
import { RjsfDisplayLabel } from './display-label';

type YesNoWidgetOptions = {
  yesColor?: string;
  noColor?: string;
};

export const RadioYesNoWidget: FunctionComponent<WidgetProps> = ({
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
}) => {
  const styles = useStyles();

  const displayLabel = getRjsfDisplayLabel({ label, required, hideLabel });
  const enumOptions = mapEnumOptions(options);
  const widgetOptions = (options ?? {}) as YesNoWidgetOptions;

  const yesOption = enumOptions.find((opt: EnumOptionDisplay) => opt.value === 'yes') ?? enumOptions[0];
  const noOption = enumOptions.find((opt: EnumOptionDisplay) => opt.value === 'no') ?? enumOptions[1];

  const currentValue = typeof value === 'string' && value.length > 0 ? value : undefined;

  const handleSelect = (nextValue: string) => {
    if (disabled || readonly) return;
    onChange(nextValue);
    onBlur(id, nextValue);
  };

  return (
    <View style={styles.widgetBlock}>
      <RjsfDisplayLabel label={displayLabel} style={styles.title} />

      <View style={styles.row}>
        {yesOption ? (
          <Pressable
            onPress={() => handleSelect(yesOption.value)}
            style={styles.option}
            disabled={disabled || readonly}
          >
            <RadioButton
              value={yesOption.value}
              status={currentValue === yesOption.value ? 'checked' : 'unchecked'}
              onPress={() => handleSelect(yesOption.value)}
              disabled={disabled || readonly}
            />
            <Text
              variant="bodyLarge"
              style={[styles.optionLabel, widgetOptions.yesColor ? { color: widgetOptions.yesColor } : null]}
            >
              {yesOption.label}
            </Text>
          </Pressable>
        ) : null}

        {noOption ? (
          <Pressable onPress={() => handleSelect(noOption.value)} style={styles.option} disabled={disabled || readonly}>
            <RadioButton
              value={noOption.value}
              status={currentValue === noOption.value ? 'checked' : 'unchecked'}
              onPress={() => handleSelect(noOption.value)}
              disabled={disabled || readonly}
            />
            <Text
              variant="bodyLarge"
              style={[styles.optionLabel, widgetOptions.noColor ? { color: widgetOptions.noColor } : null]}
            >
              {noOption.label}
            </Text>
          </Pressable>
        ) : null}
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
    option: {
      flexDirection: 'row',
      alignItems: 'center',
    },
    optionLabel: {
      marginLeft: theme.spacing(0.5),
    },
  });
};
