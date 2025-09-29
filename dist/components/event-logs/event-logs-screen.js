import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { LegendList } from '@legendapp/list';
import { useToggle } from '@uidotdev/usehooks';
import { format } from 'date-fns';
import { filesize } from 'filesize';
import { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { StyleSheet, View } from 'react-native';
import { Button, Icon, IconButton, List, Text } from 'react-native-paper';
import { deleteAllLogFiles, loadAllLogFilesInfo } from '../../logger/logger';
import { useAppTheme } from '../../theme/theme';
import { shareTextFile } from '../../utils/sharing.utils';
import { DialogOkCancel } from '../dialogs/dialog-ok-cancel';
export const EventLogsScreen = () => {
    const styles = useStyles();
    const theme = useAppTheme();
    const { t } = useTranslation();
    const [files, setFiles] = useState([]);
    useEffect(() => {
        loadAllLogFilesInfo().then(setFiles);
    }, []);
    const [isDeleteDialogVisible, toggleDeleteConfirmVisibility] = useToggle(false);
    const onDeleteConfirmed = () => {
        deleteAllLogFiles()
            .then(() => setFiles([]))
            .finally(() => toggleDeleteConfirmVisibility());
    };
    return (_jsxs(View, { style: styles.container, children: [_jsx(Text, { variant: "titleMedium", style: styles.title, children: t('common:eventLogs') }), _jsx(LegendList, { data: files, renderItem: ({ item }) => {
                    var _a, _b;
                    const title = item.uri.split('/').pop();
                    const updatedAt = 'modificationTime' in item ? new Date(((_a = item.modificationTime) !== null && _a !== void 0 ? _a : 0) * 1000) : new Date();
                    const formattedUpdatedAt = format(updatedAt, 'yyyy-MM-dd HH:mm:ss');
                    const size = 'size' in item ? filesize((_b = item.size) !== null && _b !== void 0 ? _b : 0) : '';
                    const description = `${formattedUpdatedAt} [ ${size} ]`;
                    return (_jsx(List.Item, { title: title, description: description, left: (props) => (_jsx(List.Icon, Object.assign({}, props, { icon: (props) => _jsx(Icon, Object.assign({ source: "file-document" }, props)) }))), right: () => (_jsx(IconButton, { iconColor: theme.colors.primary, icon: "share", onPress: () => shareTextFile(item.uri) })) }));
                }, estimatedItemSize: 30 }), _jsx(View, { style: styles.actions, children: _jsx(Button, { mode: "outlined", icon: "delete", onPress: () => toggleDeleteConfirmVisibility(), children: t('common:delete') }) }), _jsx(DialogOkCancel, { icon: "alert", title: t('common:confirm'), description: t('common:deleteAllLogsFilesConfirmation'), isVisible: isDeleteDialogVisible, onOk: onDeleteConfirmed, onCancel: toggleDeleteConfirmVisibility })] }));
};
const useStyles = () => {
    const theme = useAppTheme();
    return StyleSheet.create({
        container: {
            flex: 1,
            padding: theme.spacing(2),
        },
        title: {
            marginBottom: theme.spacing(2),
        },
        fileItem: {
            padding: theme.spacing(2),
            borderBottomWidth: 1,
            borderBottomColor: theme.colors.outline,
        },
        actions: {
            flexDirection: 'row',
            justifyContent: 'center',
            gap: theme.spacing(2),
        },
        sharePressed: {
            opacity: 0.5,
        },
    });
};
//# sourceMappingURL=event-logs-screen.js.map