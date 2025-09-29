import React from 'react';
import { Platform, StyleSheet } from 'react-native';
import { ScrollView } from 'react-native-gesture-handler';
import { Text } from 'react-native-paper';
import { useAppTheme } from '../../theme/theme';
export const ErrorDetails = ({ error, title = 'Error' }) => {
    const styles = useStyles();
    const errorToStringify = Object.assign(Object.assign({}, error), { stack: undefined });
    return (<ScrollView style={styles.container}>
      <Text variant="bodySmall" style={styles.errorText}>
        {title}
      </Text>
      <Text style={styles.jsonText}>{JSON.stringify(errorToStringify, null, 2)}</Text>
    </ScrollView>);
};
const useStyles = () => {
    const theme = useAppTheme();
    return StyleSheet.create({
        container: {
            flex: 1,
            padding: theme.spacing(2),
            borderWidth: StyleSheet.hairlineWidth,
            borderColor: theme.colors.error,
        },
        errorText: {
            color: theme.colors.error,
        },
        jsonText: {
            fontSize: 12,
            fontFamily: Platform.select({
                ios: 'Menlo',
                default: 'monospace',
            }),
        },
    });
};
//# sourceMappingURL=error-details.js.map