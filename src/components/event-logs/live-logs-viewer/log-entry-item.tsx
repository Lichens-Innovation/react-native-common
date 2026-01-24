import React, { type FunctionComponent } from 'react';
import { Platform, Pressable, ScrollView, StyleSheet } from 'react-native';
import { Text } from 'react-native-paper';

import { useTranslation } from 'react-i18next';
import { LogEntry } from '../../../logger/logger.types';
import { useLogEntryColor } from '../../../logger/use-log-entry-color';
import { useAppTheme } from '../../../theme/theme';
import { setClipboardTextContent } from '../../../utils/clipboard.utils';
import { useSnackbar } from '../../snack-bar/snackbar-provider';
import { formatLogMessage } from './logs-viewer.utils';

interface LogEntryItemProps {
  logEntry: LogEntry;
}

export const LogEntryItem: FunctionComponent<LogEntryItemProps> = ({ logEntry }) => {
  const styles = useStyles();
  const { showSnackbarMessage } = useSnackbar();
  const { t } = useTranslation();

  const color = useLogEntryColor(logEntry.level.severity);

  const handleLongPress = async (text: string) => {
    await setClipboardTextContent(text);
    showSnackbarMessage(t('common:copiedToClipboard'));
  };

  return (
    <ScrollView horizontal={true} showsHorizontalScrollIndicator={false} contentContainerStyle={styles.logEntry}>
      <Pressable onLongPress={() => handleLongPress(logEntry.msg)}>
        <Text style={[styles.logText, { color }]}>{formatLogMessage(logEntry.msg)}</Text>
      </Pressable>
    </ScrollView>
  );
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
