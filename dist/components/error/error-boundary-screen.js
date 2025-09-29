import { router, useLocalSearchParams } from 'expo-router';
import React from 'react';
import { useTranslation } from 'react-i18next';
import { StyleSheet, View } from 'react-native';
import { Button, Card, Text } from 'react-native-paper';
import { useAppTheme } from '../../theme/theme';
import { shareCurrentLogsFile } from '../../utils/sharing.utils';
export const ErrorBoundaryScreen = () => {
    const styles = useStyles();
    const { t } = useTranslation();
    const { title, description, id } = useLocalSearchParams();
    return (<View style={styles.container}>
      <Card style={styles.card}>
        <Card.Title title={title} titleStyle={styles.errorText}/>

        <Card.Content>
          <Text variant="titleMedium" style={styles.label}>
            ID:
          </Text>
          <Text variant="bodySmall">{id}</Text>

          <Text variant="titleMedium" style={styles.label}>
            Description:
          </Text>
          <Text variant="bodySmall">{description}</Text>
        </Card.Content>

        <Card.Actions>
          <Button mode="outlined" onPress={shareCurrentLogsFile}>
            {t('common:errorBoundary.details')}
          </Button>
          <Button mode="contained" onPress={() => router.replace('/')}>
            {t('common:close')}
          </Button>
        </Card.Actions>
      </Card>
    </View>);
};
const useStyles = () => {
    const theme = useAppTheme();
    return StyleSheet.create({
        container: {
            flex: 1,
            marginTop: theme.spacing(2),
            padding: theme.spacing(2),
        },
        card: {
            borderWidth: StyleSheet.hairlineWidth,
            borderColor: theme.colors.error,
        },
        errorText: {
            color: theme.colors.error,
        },
        label: {
            marginTop: theme.spacing(1),
            color: theme.colors.onSurfaceVariant,
        },
    });
};
//# sourceMappingURL=error-boundary-screen.js.map