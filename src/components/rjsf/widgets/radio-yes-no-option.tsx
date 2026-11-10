import type { EnumOptionDisplay } from '@lichens-innovation/ts-common/rjsf';
import type { FunctionComponent } from 'react';
import { Pressable, StyleSheet } from 'react-native';
import { RadioButton, Text } from 'react-native-paper';
import { useAppTheme } from '../../../theme/theme.index';

interface RadioYesNoOptionProps {
  option: EnumOptionDisplay;
  isChecked: boolean;
  disabled: boolean;
  labelColor?: string;
  onSelect: (value: string) => void;
}

export const RadioYesNoOption: FunctionComponent<RadioYesNoOptionProps> = ({
  option,
  isChecked,
  disabled,
  labelColor,
  onSelect,
}) => {
  const styles = useStyles();
  const handlePress = () => onSelect(option.value);

  return (
    <Pressable onPress={handlePress} style={styles.option} disabled={disabled}>
      <RadioButton.Android
        value={option.value}
        status={isChecked ? 'checked' : 'unchecked'}
        onPress={handlePress}
        disabled={disabled}
      />
      <Text variant="bodyLarge" style={[styles.optionLabel, labelColor ? { color: labelColor } : null]}>
        {option.label}
      </Text>
    </Pressable>
  );
};

const useStyles = () => {
  const theme = useAppTheme();

  return StyleSheet.create({
    option: {
      flexDirection: 'row',
      alignItems: 'center',
    },
    optionLabel: {
      marginLeft: theme.spacing(0.5),
    },
  });
};
