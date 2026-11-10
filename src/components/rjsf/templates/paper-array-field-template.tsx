import type { ArrayFieldTemplateProps } from '@rjsf/utils';
import { useMemo } from 'react';
import { StyleSheet, View } from 'react-native';
import { useAppTheme } from '../../../theme/theme.index';
import { AddButton } from '../buttons/add-button';
import { PaperTemplateTitle } from './paper-template-title';

export const PaperArrayFieldTemplate = ({
  title,
  items,
  canAdd,
  onAddClick,
  registry,
  uiSchema,
}: ArrayFieldTemplateProps) => {
  const styles = useStyles();

  return (
    <View style={styles.fieldSet}>
      <PaperTemplateTitle title={title} uiSchema={uiSchema} />

      {items.map((item, index) => (
        <View key={'key' in item ? String(item.key) : index} style={styles.arrayItem}>
          {item}
        </View>
      ))}

      {canAdd && <AddButton onClick={onAddClick} registry={registry} uiSchema={uiSchema as Record<string, unknown>} />}
    </View>
  );
};

const useStyles = () => {
  const theme = useAppTheme();

  return useMemo(
    () =>
      StyleSheet.create({
        fieldSet: {
          marginVertical: theme.spacing(2),
        },
        arrayItem: {
          marginVertical: theme.spacing(1),
        },
      }),
    [theme]
  );
};
