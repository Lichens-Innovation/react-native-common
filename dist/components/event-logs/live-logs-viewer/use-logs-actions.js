import { useDebounce } from '@uidotdev/usehooks';
import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { commonLogsStore } from '../../../store/common-logs.store';
import { setClipboardTextContent } from '../../../utils/clipboard.utils';
import { useSnackbar } from '../../snack-bar/snackbar-provider';
export const useLogsActions = () => {
    const { showSnackbarMessage } = useSnackbar();
    const { t } = useTranslation();
    const [filterText, setFilterText] = useState('');
    const debouncedFilterText = useDebounce(filterText, 300);
    const filteredLogs = commonLogsStore.filterLogs(debouncedFilterText);
    const handleCopyAllLogs = async () => {
        await setClipboardTextContent(commonLogsStore.allLogsAsText);
        showSnackbarMessage(t('common:copiedToClipboard'));
    };
    return {
        filterText,
        setFilterText,
        filteredLogs,
        handleCopyAllLogs,
    };
};
//# sourceMappingURL=use-logs-actions.js.map