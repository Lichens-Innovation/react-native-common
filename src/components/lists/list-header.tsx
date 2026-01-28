import { type FunctionComponent } from 'react';
import { StyleSheet, View } from 'react-native';
import { Text } from 'react-native-paper';
import { useAppTheme } from '../../theme/theme';

interface ListHeaderProps {
  title: string;
}

export const ListHeader: FunctionComponent<ListHeaderProps> = ({ title }) => {
  const styles = useStyles();

  return (
    <View style={styles.container}>
      <Text variant="titleMedium">{title}</Text>
    </View>
  );
};

const useStyles = () => {
  const theme = useAppTheme();

  return StyleSheet.create({
    container: {
      paddingHorizontal: theme.spacing(1),
    },
  });
};
