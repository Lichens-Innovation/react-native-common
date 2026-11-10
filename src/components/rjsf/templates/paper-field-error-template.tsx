import type { FieldErrorProps } from '@rjsf/utils';
import { useMemo } from 'react';
import { StyleSheet, View } from 'react-native';
import { Text } from 'react-native-paper';
import { useAppTheme } from '../../../theme/theme.index';

export const PaperFieldErrorTemplate = ({ errors }: FieldErrorProps) => {
  const styles = useStyles();

  if (!errors || errors.length === 0) return null;

  return (
    <View style={styles.errorList}>
      {(errors as string[]).map((msg) => (
        <Text key={msg} variant="bodySmall" style={styles.fieldError}>
          {msg}
        </Text>
      ))}
    </View>
  );
};

const useStyles = () => {
  const theme = useAppTheme();

  return useMemo(
    () =>
      StyleSheet.create({
        errorList: {
          marginTop: theme.spacing(1),
          gap: theme.spacing(0.5),
        },
        fieldError: {
          color: theme.colors.error,
        },
      }),
    [theme]
  );
};
