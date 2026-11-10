import { isBlank } from '@lichens-innovation/ts-common';
import { FunctionComponent } from 'react';
import { StyleProp, TextStyle } from 'react-native';
import { Text } from 'react-native-paper';

export interface DropDownFieldTitleProps {
  label?: string;
  style: StyleProp<TextStyle>;
}

export const DropDownFieldTitle: FunctionComponent<DropDownFieldTitleProps> = ({ label, style }) => {
  if (isBlank(label)) {
    return null;
  }

  return (
    <Text variant="bodySmall" style={style}>
      {label}
    </Text>
  );
};
