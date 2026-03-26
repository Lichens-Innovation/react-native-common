import { isBlank } from '@lichens-innovation/ts-common';
import { getRjsfDisplayLabel } from '@lichens-innovation/ts-common/rjsf';
import type { WidgetProps } from '@rjsf/utils';
import type { FunctionComponent } from 'react';
import { Pressable, StyleSheet, View } from 'react-native';
import { Switch } from 'react-native-paper';
import { useAppTheme } from '../../../theme';
import { RjsfDisplayLabel } from './display-label';

export const CheckboxWidget: FunctionComponent<WidgetProps> = ({
  id,
  value,
  disabled,
  readonly,
  onChange,
  onBlur,
  label,
  hideLabel,
  required,
}) => {
  const styles = useStyles();
  const displayLabel = getRjsfDisplayLabel({ label, required, hideLabel });
  const checked = value === true;

  const handleValueChange = (newValue: boolean) => {
    onChange(newValue);
    onBlur(id, newValue);
  };

  const handleLabelPress = () => {
    if (disabled || readonly) return;
    handleValueChange(!checked);
  };

  return (
    <View style={styles.checkboxRow}>
      <Switch value={checked} onValueChange={handleValueChange} disabled={disabled} />

      {!isBlank(displayLabel) ? (
        <Pressable onPress={handleLabelPress} style={styles.checkboxLabel}>
          <RjsfDisplayLabel label={displayLabel} />
        </Pressable>
      ) : null}
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
