import type { FieldHelpProps } from '@rjsf/utils';
import { useMemo } from 'react';
import { StyleSheet } from 'react-native';
import { Text } from 'react-native-paper';
import { useAppTheme } from '../../../theme/theme.index';

export const PaperFieldHelpTemplate = ({ help }: FieldHelpProps) => {
  const styles = useStyles();

  if (!help) return null;

  return (
    <Text variant="bodySmall" style={styles.help}>
      {typeof help === 'string' ? help : null}
    </Text>
  );
};

const useStyles = () => {
  const theme = useAppTheme();

  return useMemo(
    () =>
      StyleSheet.create({
        help: {
          marginTop: theme.spacing(1),
          opacity: 0.8,
        },
      }),
    [theme]
  );
};
