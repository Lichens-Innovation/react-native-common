import { FunctionComponent } from 'react';
import { StyleProp, ViewStyle } from 'react-native';
import { IconButton } from 'react-native-paper';
import { useAppTheme } from '../../theme/theme';

export interface DropDownClearButtonProps {
  onPress: () => void;
  style: StyleProp<ViewStyle>;
}

export const DropDownClearButton: FunctionComponent<DropDownClearButtonProps> = ({ onPress, style }) => {
  const theme = useAppTheme();

  return (
    <IconButton
      icon="close"
      size={20}
      iconColor={theme.colors.onBackground}
      mode="contained"
      onPress={onPress}
      style={style}
    />
  );
};
