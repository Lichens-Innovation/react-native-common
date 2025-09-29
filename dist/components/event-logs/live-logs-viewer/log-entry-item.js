import { jsx as _jsx } from "react/jsx-runtime";
import { Platform, Pressable, ScrollView, StyleSheet } from 'react-native';
import { Text } from 'react-native-paper';
import { useTranslation } from 'react-i18next';
import { useLogEntryColor } from '../../../logger/use-log-entry-color';
import { useAppTheme } from '../../../theme/theme';
import { setClipboardTextContent } from '../../../utils/clipboard.utils';
import { useSnackbar } from '../../snack-bar/snackbar-provider';
import { formatLogMessage } from './logs-viewer.utils';
export const LogEntryItem = ({ logEntry }) => {
    const styles = useStyles();
    const { showSnackbarMessage } = useSnackbar();
    const { t } = useTranslation();
    const color = useLogEntryColor(logEntry.level.severity);
    const handleLongPress = async (text) => {
        await setClipboardTextContent(text);
        showSnackbarMessage(t('common:copiedToClipboard'));
    };
    return (_jsx(ScrollView, { horizontal: true, showsHorizontalScrollIndicator: false, contentContainerStyle: styles.logEntry, children: _jsx(Pressable, { onLongPress: () => handleLongPress(logEntry.msg), children: _jsx(Text, { style: [styles.logText, { color }], children: formatLogMessage(logEntry.msg) }) }) }));
};
const useStyles = () => {
    const theme = useAppTheme();
    return StyleSheet.create({
        logEntry: {
            paddingHorizontal: theme.spacing(0.5),
        },
        logText: {
            fontFamily: Platform.select({
                ios: 'Menlo',
                default: 'monospace',
            }),
        },
    });
};
//# sourceMappingURL=log-entry-item.js.map