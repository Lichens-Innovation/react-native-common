import type { EnumOptionDisplay } from '@lichens-innovation/ts-common/rjsf';
import { getRjsfDisplayLabel, mapEnumOptions, toStringOrEmpty } from '@lichens-innovation/ts-common/rjsf';
import type { WidgetProps } from '@rjsf/utils';
import type { FunctionComponent } from 'react';
import { StyleSheet, View } from 'react-native';
import { RadioButton } from 'react-native-paper';
import { useAppTheme } from '~/theme';
import { RjsfDisplayLabel } from './display-label';

export const RadioWidget: FunctionComponent<WidgetProps> = ({
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
  const strValue = toStringOrEmpty(value);

  return (
    <View style={styles.widgetBlock}>
      <RjsfDisplayLabel label={displayLabel} style={styles.radioTitle} />
      <RadioButton.Group
        onValueChange={(v) => {
          onChange(v);
          onBlur(id, v);
        }}
        value={strValue}
      >
        {enumOptions.map((opt: EnumOptionDisplay) => (
          <RadioButton.Item
            key={opt.value}
            label={opt.label}
            value={opt.value}
            disabled={disabled || readonly}
            style={styles.radioItem}
          />
        ))}
      </RadioButton.Group>
    </View>
  );
};

const useStyles = () => {
  const theme = useAppTheme();
  return StyleSheet.create({
    widgetBlock: {
      marginVertical: theme.spacing(0.5),
    },
    radioTitle: {
      marginBottom: theme.spacing(1),
    },
    radioItem: {
      marginVertical: theme.spacing(0.25),
    },
  });
};
