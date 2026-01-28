import { type FunctionComponent } from 'react';
import { StyleSheet, View } from 'react-native';
import { useAppTheme } from '../../theme/theme';

export const ListItemsSeparator: FunctionComponent = () => {
  const styles = useStyles();
  return <View style={styles.separator} />;
};

const useStyles = () => {
  const theme = useAppTheme();

  return StyleSheet.create({
    separator: {
      height: StyleSheet.hairlineWidth,
      backgroundColor: theme.colors.outline,
    },
  });
};
