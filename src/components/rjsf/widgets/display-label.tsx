import { isBlank } from '@lichens-innovation/ts-common';
import type { StyleProp, TextStyle } from 'react-native';
import { Text } from 'react-native-paper';

export interface RjsfDisplayLabelProps {
  label?: string;
  style?: StyleProp<TextStyle>;
  color?: string;
}

export const RjsfDisplayLabel = ({ label, style, color }: RjsfDisplayLabelProps) => {
  if (isBlank(label)) return null;

  return (
    <Text variant="bodyLarge" style={[color ? { color } : null, style]}>
      {label}
    </Text>
  );
};
