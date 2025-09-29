import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useSnackbar } from '../components/snack-bar/snackbar-provider';
import { logger } from '../logger/logger';
import { pickSingleFile } from '../utils/file-picker.utils';
export const useSingleFileSelector = ({ mimeTypes, copyToCacheDirectory = false }) => {
    const { t } = useTranslation();
    const { showSnackbarMessage } = useSnackbar();
    const [selectedFile, setSelectedFile] = useState();
    const handleFileSelection = async () => {
        try {
            const type = mimeTypes !== null && mimeTypes !== void 0 ? mimeTypes : ['*/*'];
            const result = await pickSingleFile({ type, copyToCacheDirectory });
            if (!result.exists)
                return;
            const { name, size, uri, mimeType, lastModified } = result;
            if (uri && name) {
                setSelectedFile({ name, size, uri, lastModified, mimeType });
            }
        }
        catch (e) {
            logger.error('[handleFileSelection] error selecting file', e);
            showSnackbarMessage(t('common:errorUnexpected'));
        }
    };
    return {
        selectedFile,
        handleFileSelection,
        hasSelectedFile: !!selectedFile,
    };
};
//# sourceMappingURL=use-single-file-selector.js.map