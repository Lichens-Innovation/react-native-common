import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { router, useLocalSearchParams } from 'expo-router';
import { useTranslation } from 'react-i18next';
import { StyleSheet, View } from 'react-native';
import { Button, Card, Text } from 'react-native-paper';
import { useAppTheme } from '../../theme/theme';
import { shareCurrentLogsFile } from '../../utils/sharing.utils';
export const ErrorBoundaryScreen = () => {
    const styles = useStyles();
    const { t } = useTranslation();
    const { title, description, id } = useLocalSearchParams();
    return (_jsx(View, { style: styles.container, children: _jsxs(Card, { style: styles.card, children: [_jsx(Card.Title, { title: title, titleStyle: styles.errorText }), _jsxs(Card.Content, { children: [_jsx(Text, { variant: "titleMedium", style: styles.label, children: "ID:" }), _jsx(Text, { variant: "bodySmall", children: id }), _jsx(Text, { variant: "titleMedium", style: styles.label, children: "Description:" }), _jsx(Text, { variant: "bodySmall", children: description })] }), _jsxs(Card.Actions, { children: [_jsx(Button, { mode: "outlined", onPress: shareCurrentLogsFile, children: t('common:errorBoundary.details') }), _jsx(Button, { mode: "contained", onPress: () => router.replace('/'), children: t('common:close') })] })] }) }));
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