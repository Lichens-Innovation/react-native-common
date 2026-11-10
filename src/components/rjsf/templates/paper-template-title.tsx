import { isBlank, isNotBlank } from '@lichens-innovation/ts-common';
import { getRjsfLabelColor } from '@lichens-innovation/ts-common/rjsf';
import { getUiOptions, type UiSchema } from '@rjsf/utils';
import { useMemo, type FunctionComponent } from 'react';
import { StyleSheet } from 'react-native';
import { Text } from 'react-native-paper';
import { useAppTheme } from '../../../theme/theme.index';

interface PaperTemplateTitleProps {
  title?: string;
  uiSchema?: UiSchema;
}

export const PaperTemplateTitle: FunctionComponent<PaperTemplateTitleProps> = ({ title, uiSchema }) => {
  const styles = useStyles();
  const labelColor = getRjsfLabelColor(getUiOptions(uiSchema));

  if (isBlank(title)) return null;

  return (
    <Text variant="titleMedium" style={[styles.title, isNotBlank(labelColor) ? { color: labelColor } : null]}>
      {title}
    </Text>
  );
};

const useStyles = () => {
  const theme = useAppTheme();

  return useMemo(
    () =>
      StyleSheet.create({
        title: {
          marginBottom: theme.spacing(1),
        },
      }),
    [theme]
  );
};
