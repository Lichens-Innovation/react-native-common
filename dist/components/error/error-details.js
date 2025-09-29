import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { Platform, StyleSheet } from 'react-native';
import { ScrollView } from 'react-native-gesture-handler';
import { Text } from 'react-native-paper';
import { useAppTheme } from '../../theme/theme';
export const ErrorDetails = ({ error, title = 'Error' }) => {
    const styles = useStyles();
    const errorToStringify = Object.assign(Object.assign({}, error), { stack: undefined });
    return (_jsxs(ScrollView, { style: styles.container, children: [_jsx(Text, { variant: "bodySmall", style: styles.errorText, children: title }), _jsx(Text, { style: styles.jsonText, children: JSON.stringify(errorToStringify, null, 2) })] }));
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