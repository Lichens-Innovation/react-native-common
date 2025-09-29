import { LegendList } from '@legendapp/list';
import { useToggle } from '@uidotdev/usehooks';
import { format } from 'date-fns';
import { filesize } from 'filesize';
import React, { useEffect, useState } from 'react';
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
    return (<View style={styles.container}>
      <Text variant="titleMedium" style={styles.title}>
        {t('common:eventLogs')}
      </Text>

      <LegendList data={files} renderItem={({ item }) => {
            var _a, _b;
            const title = item.uri.split('/').pop();
            const updatedAt = 'modificationTime' in item ? new Date(((_a = item.modificationTime) !== null && _a !== void 0 ? _a : 0) * 1000) : new Date();
            const formattedUpdatedAt = format(updatedAt, 'yyyy-MM-dd HH:mm:ss');
            const size = 'size' in item ? filesize((_b = item.size) !== null && _b !== void 0 ? _b : 0) : '';
            const description = `${formattedUpdatedAt} [ ${size} ]`;
            return (<List.Item title={title} description={description} left={(props) => (<List.Icon {...props} icon={(props) => <Icon source="file-document" {...props}/>}/>)} right={() => (<IconButton iconColor={theme.colors.primary} icon="share" onPress={() => shareTextFile(item.uri)}/>)}/>);
        }} estimatedItemSize={30}/>

      <View style={styles.actions}>
        <Button mode="outlined" icon="delete" onPress={() => toggleDeleteConfirmVisibility()}>
          {t('common:delete')}
        </Button>
      </View>

      <DialogOkCancel icon="alert" title={t('common:confirm')} description={t('common:deleteAllLogsFilesConfirmation')} isVisible={isDeleteDialogVisible} onOk={onDeleteConfirmed} onCancel={toggleDeleteConfirmVisibility}/>
    </View>);
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