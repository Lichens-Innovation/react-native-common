import { useMemo, type FunctionComponent } from 'react';
import { useTranslation } from 'react-i18next';
import { StyleSheet, View } from 'react-native';
import { Text } from 'react-native-paper';
import { useAppTheme } from '../../theme';

type UnsupportedFieldNoticeProps = {
  /** The field's title, or its id when it has none. */
  title?: string;
};

/**
 * What the sheet shows in place of a field the app cannot draw: its title, then "This field can't be
 * displayed." Shared by the unsupported-field template (SPOTD-1300) and the unknown widget (SPOTD-1346).
 */
export const UnsupportedFieldNotice: FunctionComponent<UnsupportedFieldNoticeProps> = ({ title }) => {
  const styles = useStyles();
  const { t } = useTranslation();

  return (
    <View>
      {title ? <Text variant="bodyMedium">{title}</Text> : null}
      <Text variant="bodySmall" style={styles.message}>
        {t('common:form.unsupportedField')}
      </Text>
    </View>
  );
};

const useStyles = () => {
  const theme = useAppTheme();

  return useMemo(() => StyleSheet.create({ message: { color: theme.colors.error } }), [theme]);
};
