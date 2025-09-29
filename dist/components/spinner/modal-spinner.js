import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { StyleSheet, View } from 'react-native';
import { ActivityIndicator, Button, Dialog, Portal, Text } from 'react-native-paper';
import { useAppTheme } from '../../theme/theme';
export const ModalSpinner = ({ isVisible, title = 'Loading', description = 'Please wait...', modelLoadingLogs, onDismiss, }) => {
    const styles = useStyles();
    if (!isVisible) {
        return null;
    }
    return (_jsx(Portal, { children: _jsxs(Dialog, { visible: isVisible, onDismiss: onDismiss, children: [_jsx(Dialog.Title, { style: styles.title, children: title }), _jsxs(Dialog.Content, { children: [_jsx(ActivityIndicator, { style: styles.spinner }), _jsx(Text, { children: description }), _jsx(View, { style: styles.progressLogs, children: modelLoadingLogs.map((log) => (_jsx(Text, { numberOfLines: 1, ellipsizeMode: "tail", style: styles.progressLog, children: log }, log))) })] }), _jsx(Dialog.Actions, { children: _jsx(Button, { onPress: onDismiss, children: "Cancel" }) })] }) }));
};
const useStyles = () => {
    const theme = useAppTheme();
    return StyleSheet.create({
        title: {
            textAlign: 'center',
        },
        spinner: {
            marginVertical: theme.spacing(3),
        },
        progressLogs: {
            height: 80,
            maxHeight: 80,
            overflow: 'scroll',
            marginVertical: 10,
            width: '100%',
        },
        progressLog: {
            color: theme.colors.secondary,
            width: '100%',
        },
    });
};
//# sourceMappingURL=modal-spinner.js.map