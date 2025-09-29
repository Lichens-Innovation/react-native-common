import { LegendList } from '@legendapp/list';
import { observer } from 'mobx-react-lite';
import React, { useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { LogBox, Platform, StyleSheet, View } from 'react-native';
import { IconButton, TextInput } from 'react-native-paper';
import { commonLogsStore } from '../../../store/common-logs.store';
import { useAppTheme } from '../../../theme/theme';
import { LogEntryItem } from './log-entry-item';
import { LogEntryItemSuffix } from './log-entry-item-suffix';
import { useAutoScroll } from './use-auto-scroll';
import { useLogsActions } from './use-logs-actions';
export const LogsViewer = observer(({ shouldDisplayToolbar = true, shouldAutoScroll = false }) => {
    const styles = useStyles();
    const { t } = useTranslation();
    const { filterText, setFilterText, filteredLogs, handleCopyAllLogs } = useLogsActions();
    const { listRef, scrollToBottom, toggleAutoScroll, isAutoScrollEnabled } = useAutoScroll(shouldAutoScroll);
    useEffect(() => scrollToBottom(filteredLogs), [filteredLogs, scrollToBottom]);
    useEffect(() => LogBox.ignoreAllLogs(), []);
    return (<View style={styles.container}>
        {shouldDisplayToolbar && (<View style={styles.actionsBar}>
            <TextInput mode={Platform.OS === 'windows' ? 'flat' : 'outlined'} autoCapitalize="none" value={filterText} onChangeText={setFilterText} placeholder={t('common:logs.filter')} style={styles.filterInput} right={Platform.OS === 'windows' ? undefined : (<LogEntryItemSuffix filterText={filterText} onPress={() => setFilterText('')}/>)}/>
            <IconButton icon={isAutoScrollEnabled ? 'arrow-down-bold' : 'arrow-down-bold-outline'} mode="contained" onPress={() => toggleAutoScroll()} style={styles.button} accessibilityLabel={t('common:toggleAutoScroll')}/>
            <IconButton icon="delete" mode="contained" onPress={() => commonLogsStore.clearLogs()} style={styles.button} accessibilityLabel={t('common:logs.clear')}/>
            <IconButton icon="content-copy" mode="contained" onPress={handleCopyAllLogs} style={styles.button} accessibilityLabel={t('common:logs.copyAll')}/>
          </View>)}

        <LegendList ref={listRef} data={filteredLogs} renderItem={({ item }) => <LogEntryItem logEntry={item}/>} estimatedItemSize={30} keyExtractor={(logEntry, index) => `${logEntry.msg.substring(0, 20)}_${index}`}/>
      </View>);
});
const useStyles = () => {
    const theme = useAppTheme();
    return StyleSheet.create({
        container: {
            flex: 1,
        },
        actionsBar: {
            flexDirection: 'row',
            padding: theme.spacing(0.5),
            marginBottom: theme.spacing(0.5),
            alignItems: 'center',
        },
        filterInput: {
            flex: 1,
            height: 40,
        },
        button: {
            marginVertical: 0,
        },
    });
};
//# sourceMappingURL=logs-viewer.js.map