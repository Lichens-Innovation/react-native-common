import { getTemplate, getUiOptions, type ArrayFieldItemTemplateProps } from '@rjsf/utils';
import { createElement, useMemo } from 'react';
import { StyleSheet, View } from 'react-native';
import { useAppTheme } from '../../../theme/theme.index';

// RJSF's default item template renders a <div>, which crashes on React Native. habit-hooks-disable non-essential-comment
export const PaperArrayFieldItemTemplate = ({
  children,
  buttonsProps,
  hasToolbar,
  registry,
  uiSchema,
}: ArrayFieldItemTemplateProps) => {
  const styles = useStyles();
  const uiOptions = getUiOptions(uiSchema);
  // getTemplate looks up a component registered once in the registry, it does not create one. habit-hooks-disable non-essential-comment
  const buttonsTemplate = getTemplate('ArrayFieldItemButtonsTemplate', registry, uiOptions);

  return (
    <View style={styles.arrayItemRow}>
      <View style={styles.arrayItemContent}>{children}</View>
      {hasToolbar && <View style={styles.arrayItemToolbar}>{createElement(buttonsTemplate, buttonsProps)}</View>}
    </View>
  );
};

const useStyles = () => {
  const theme = useAppTheme();

  return useMemo(
    () =>
      StyleSheet.create({
        arrayItemRow: {
          flexDirection: 'row',
          alignItems: 'center',
          marginVertical: theme.spacing(1),
        },
        arrayItemContent: {
          flex: 1,
        },
        arrayItemToolbar: {
          flexDirection: 'column',
          alignItems: 'center',
          marginLeft: theme.spacing(1),
          borderLeftWidth: 1,
          borderTopWidth: 1,
          borderLeftColor: theme.colors.surfaceVariant,
          borderTopColor: theme.colors.surfaceVariant,
          height: '100%',
          width: 32,
        },
      }),
    [theme]
  );
};
