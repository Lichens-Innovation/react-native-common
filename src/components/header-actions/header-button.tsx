import { type FunctionComponent } from 'react';
import { StyleProp, StyleSheet, ViewStyle } from 'react-native';
import { IconButton } from 'react-native-paper';

import { useAppTheme } from '../../theme/theme';

type Props = {
  iconName: string;
  onPress?: () => void;
  style?: StyleProp<ViewStyle>;
};

export const HeaderButton: FunctionComponent<Props> = ({ iconName, onPress, style }) => {
  const styles = useStyles();
  const theme = useAppTheme();

  return (
    <IconButton
      icon={iconName}
      size={25}
      iconColor={theme.colors.primary}
      style={[styles.iconStyle, style]}
      onPress={onPress}
    />
  );
};

const useStyles = () => {
  const theme = useAppTheme();

  return StyleSheet.create({
    iconStyle: {
      marginHorizontal: theme.spacing(2),
      marginVertical: 0,
    },
  });
};
