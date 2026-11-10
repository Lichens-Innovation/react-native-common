import { LegendList } from '@legendapp/list';
import { useToggle } from '@uidotdev/usehooks';
import React, { FunctionComponent, useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { StyleSheet, View } from 'react-native';
import { Button, Text } from 'react-native-paper';
import { deleteAllLogFiles, loadAllLogFilesInfo } from '../../logger/logger';
import { FileInfo } from '../../services/files/native-file-system.types';
import { useAppTheme } from '../../theme/theme';
import { DialogOkCancel } from '../dialogs/dialog-ok-cancel';
import { LogFileListItem } from './log-file-list-item';

export const EventLogsScreen: FunctionComponent = () => {
  const styles = useStyles();
  const { t } = useTranslation();
  const [files, setFiles] = useState<FileInfo[]>([]);

  useEffect(() => {
    void loadAllLogFilesInfo().then(setFiles);
  }, []);

  const [isDeleteDialogVisible, toggleDeleteConfirmVisibility] = useToggle(false);
  const onDeleteConfirmed = () => {
    void deleteAllLogFiles()
      .then(() => setFiles([]))
      .finally(() => toggleDeleteConfirmVisibility());
  };

  return (
    <View style={styles.container}>
      <Text variant="titleMedium" style={styles.title}>
        {t('common:eventLogs')}
      </Text>

      <LegendList data={files} renderItem={({ item }) => <LogFileListItem file={item} />} estimatedItemSize={30} />

      <View style={styles.actions}>
        <Button mode="outlined" icon="delete" onPress={() => toggleDeleteConfirmVisibility()}>
          {t('common:delete')}
        </Button>
      </View>

      <DialogOkCancel
        icon="alert"
        title={t('common:confirm')}
        description={t('common:deleteAllLogsFilesConfirmation')}
        isVisible={isDeleteDialogVisible}
        onOk={onDeleteConfirmed}
        onCancel={toggleDeleteConfirmVisibility}
      />
    </View>
  );
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
