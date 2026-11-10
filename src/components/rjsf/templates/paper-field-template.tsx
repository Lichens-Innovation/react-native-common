import type { FieldTemplateProps } from '@rjsf/utils';
import { useMemo } from 'react';
import { StyleSheet, View } from 'react-native';
import { useAppTheme } from '../../../theme/theme.index';

export const PaperFieldTemplate = ({ children, errors }: FieldTemplateProps) => {
  const styles = useStyles();

  return (
    <View style={styles.field}>
      {children}
      {errors}
    </View>
  );
};

const useStyles = () => {
  const theme = useAppTheme();

  return useMemo(
    () =>
      StyleSheet.create({
        field: {
          marginVertical: theme.spacing(0.5),
          flex: 1,
        },
      }),
    [theme]
  );
};
