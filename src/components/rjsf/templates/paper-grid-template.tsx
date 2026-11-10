import type { GridTemplateProps } from '@rjsf/utils';
import { useMemo } from 'react';
import { StyleSheet, View } from 'react-native';
import { useAppTheme } from '../../../theme/theme.index';

export const PaperGridTemplate = ({ children, column, style, ...rest }: GridTemplateProps) => {
  const styles = useStyles();
  const layoutStyle = column ? styles.gridCol : styles.gridRow;

  return (
    <View style={[layoutStyle, style]} {...rest}>
      {children}
    </View>
  );
};

const useStyles = () => {
  const theme = useAppTheme();

  return useMemo(
    () =>
      StyleSheet.create({
        gridRow: {
          flexDirection: 'row',
          flexWrap: 'wrap',
          gap: theme.spacing(1),
        },
        gridCol: {
          flexDirection: 'column',
          flex: 1,
          gap: theme.spacing(1),
        },
      }),
    [theme]
  );
};
