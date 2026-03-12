import { isBlank } from '@lichens-innovation/ts-common';
import type { StyleProp, TextStyle } from 'react-native';
import { Text } from 'react-native-paper';

export interface RjsfDisplayLabelProps {
  label?: string;
  style?: StyleProp<TextStyle>;
}

export const RjsfDisplayLabel = ({ label, style }: RjsfDisplayLabelProps) => {
  if (isBlank(label)) return null;

  return (
    <Text variant="bodyLarge" style={style}>
      {label}
    </Text>
  );
};
