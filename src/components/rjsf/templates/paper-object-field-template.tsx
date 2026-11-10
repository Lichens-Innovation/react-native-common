import type { ObjectFieldTemplateProps } from '@rjsf/utils';
import { useMemo } from 'react';
import { StyleSheet, View } from 'react-native';
import { Text } from 'react-native-paper';
import { useAppTheme } from '../../../theme/theme.index';
import { PaperTemplateTitle } from './paper-template-title';

export const PaperObjectFieldTemplate = ({ title, description, properties, uiSchema }: ObjectFieldTemplateProps) => {
  const styles = useStyles();

  return (
    <View style={styles.fieldSet}>
      <PaperTemplateTitle title={title} uiSchema={uiSchema} />

      {!!description && (
        <Text variant="bodySmall" style={styles.description}>
          {typeof description === 'string' ? description : null}
        </Text>
      )}

      {properties.map((prop) => {
        if (prop.hidden) return null;
        return <View key={prop.name}>{prop.content}</View>;
      })}
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
        description: {
          marginBottom: theme.spacing(2),
          opacity: 0.8,
        },
      }),
    [theme]
  );
};
