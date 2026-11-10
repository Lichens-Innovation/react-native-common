import { isBlank } from '@lichens-innovation/ts-common';
import type { WidgetProps } from '@rjsf/utils';
import type { FunctionComponent } from 'react';
import { Pressable, StyleSheet, View } from 'react-native';
import { Switch } from 'react-native-paper';
import { useAppTheme } from '../../../theme/theme.index';
import { RjsfDisplayLabel } from './display-label';
import { getWidgetTitle } from './shared/widget-title.utils';
import { useCommitWidgetValue } from './shared/use-commit-widget-value';
import { isWidgetDisplayOnly } from './shared/widget-state.utils';

export const CheckboxWidget: FunctionComponent<WidgetProps> = (props) => {
  const { value, disabled } = props;
  const styles = useStyles();
  const commitValue = useCommitWidgetValue(props);
  const widgetTitle = getWidgetTitle(props);
  const checked = value === true;

  const handleLabelPress = () => {
    if (isWidgetDisplayOnly(props)) return;
    commitValue(!checked);
  };

  return (
    <View style={styles.checkboxRow}>
      <Switch value={checked} onValueChange={commitValue} disabled={disabled} />

      {isBlank(widgetTitle.label) ? null : (
        <Pressable onPress={handleLabelPress} style={styles.checkboxLabel}>
          <RjsfDisplayLabel {...widgetTitle} />
        </Pressable>
      )}
    </View>
  );
};

const useStyles = () => {
  const theme = useAppTheme();

  return StyleSheet.create({
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
