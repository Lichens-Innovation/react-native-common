import { type EnumOptionDisplay, toStringOrEmpty } from '@lichens-innovation/ts-common/rjsf';
import type { WidgetProps } from '@rjsf/utils';
import type { FunctionComponent } from 'react';
import { StyleSheet, View } from 'react-native';
import { RadioButton } from 'react-native-paper';
import { useAppTheme } from '../../../theme/theme.index';
import { RjsfDisplayLabel } from './display-label';
import { useEnumOptionsWidget } from './shared/use-enum-options-widget';

export const RadioWidget: FunctionComponent<WidgetProps> = (props) => {
  const { value } = props;
  const styles = useStyles();
  const { commitValue, isDisplayOnly, widgetTitle, enumOptions } = useEnumOptionsWidget(props);
  const strValue = toStringOrEmpty(value);

  return (
    <View style={styles.widgetBlock}>
      <RjsfDisplayLabel {...widgetTitle} style={styles.radioTitle} />
      <RadioButton.Group onValueChange={commitValue} value={strValue}>
        {enumOptions.map((opt: EnumOptionDisplay) => (
          <RadioButton.Item
            key={opt.value}
            label={opt.label}
            value={opt.value}
            disabled={isDisplayOnly}
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
