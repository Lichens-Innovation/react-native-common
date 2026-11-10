import Slider from '@react-native-community/slider';
import type { WidgetProps } from '@rjsf/utils';
import type { FunctionComponent } from 'react';
import { StyleSheet, View } from 'react-native';
import { Text } from 'react-native-paper';
import { useAppTheme } from '../../../theme/theme.index';
import { RjsfDisplayLabel } from './display-label';
import { getWidgetTitle } from './shared/widget-title.utils';
import { useCommitWidgetValue } from './shared/use-commit-widget-value';
import { isWidgetDisplayOnly } from './shared/widget-state.utils';

export const RangeWidget: FunctionComponent<WidgetProps> = (props) => {
  const { value, schema } = props;
  const theme = useAppTheme();
  const commitValue = useCommitWidgetValue(props);
  const styles = useStyles();
  const widgetTitle = getWidgetTitle(props);
  const hasSchemaMin = typeof schema?.minimum === 'number';
  const min = hasSchemaMin ? schema.minimum : 0;
  const hasSchemaMax = typeof schema?.maximum === 'number';
  const max = hasSchemaMax ? schema.maximum : 100;
  const hasValidValue = typeof value === 'number' && !Number.isNaN(value);
  const numValue = (hasValidValue ? value : min) as number;
  const displayValue = Math.round(numValue);

  const handleSlidingComplete = (slidValue: number) => commitValue(Math.round(slidValue));

  return (
    <View style={styles.widgetBlock}>
      <RjsfDisplayLabel {...widgetTitle} style={styles.rangeLabel} />

      <View style={styles.rangeRow}>
        <Slider
          style={styles.slider}
          minimumValue={min}
          maximumValue={max}
          value={numValue}
          onSlidingComplete={handleSlidingComplete}
          minimumTrackTintColor={theme.colors.primary}
          maximumTrackTintColor={theme.colors.outline}
          disabled={isWidgetDisplayOnly(props)}
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
