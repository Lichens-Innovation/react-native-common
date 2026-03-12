import { getRjsfDisplayLabel } from '@lichens-innovation/ts-common/rjsf';
import Slider from '@react-native-community/slider';
import type { WidgetProps } from '@rjsf/utils';
import type { FunctionComponent } from 'react';
import { StyleSheet, View } from 'react-native';
import { Text } from 'react-native-paper';
import { useAppTheme } from '~/theme';
import { RjsfDisplayLabel } from './display-label';

export const RangeWidget: FunctionComponent<WidgetProps> = ({
  id,
  value,
  disabled,
  readonly,
  onChange,
  onBlur,
  label,
  hideLabel,
  required,
  rawErrors: _rawErrors,
  schema,
}) => {
  const theme = useAppTheme();
  const styles = useStyles();
  const displayLabel = getRjsfDisplayLabel({ label, required, hideLabel });
  const hasSchemaMin = typeof schema?.minimum === 'number';
  const min = hasSchemaMin ? schema.minimum : 0;
  const hasSchemaMax = typeof schema?.maximum === 'number';
  const max = hasSchemaMax ? schema.maximum : 100;
  const hasValidValue = typeof value === 'number' && !Number.isNaN(value);
  const numValue = (hasValidValue ? value : min) as number;
  const displayValue = Math.round(numValue);

  const handleSlidingComplete = (v: number) => {
    const intValue = Math.round(v);
    onChange(intValue);
    onBlur(id, intValue);
  };

  return (
    <View style={styles.widgetBlock}>
      <RjsfDisplayLabel label={displayLabel} style={styles.rangeLabel} />

      <View style={styles.rangeRow}>
        <Slider
          style={styles.slider}
          minimumValue={min}
          maximumValue={max}
          value={numValue}
          onSlidingComplete={handleSlidingComplete}
          minimumTrackTintColor={theme.colors.primary}
          maximumTrackTintColor={theme.colors.outline}
          disabled={disabled || readonly}
        />
        <Text variant="bodyMedium" style={styles.rangeValue}>
          {displayValue}
        </Text>
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
    rangeLabel: {
      marginBottom: theme.spacing(0.5),
    },
    rangeRow: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: theme.spacing(2),
    },
    slider: {
      flex: 1,
      height: 40,
    },
    rangeValue: {
      minWidth: 36,
    },
  });
};
