import { type FunctionComponent } from 'react';
import { StyleSheet } from 'react-native';
import { IconButton } from 'react-native-paper';
import { useAppTheme } from '../../theme/theme';

type Props = {
  iconName: string;
  onPress?: () => void;
};

export const HeaderButton: FunctionComponent<Props> = ({ iconName, onPress }) => {
  const styles = useStyles();
  const theme = useAppTheme();

  return (
    <IconButton icon={iconName} size={25} iconColor={theme.colors.primary} style={styles.iconStyle} onPress={onPress} />
  );
};

const useStyles = () => {
  const theme = useAppTheme();

  return StyleSheet.create({
    iconStyle: {
      marginHorizontal: theme.spacing(2),
    },
  });
};
