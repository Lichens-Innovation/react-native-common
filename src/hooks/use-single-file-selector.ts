import { useState } from 'react';
import { useTranslation } from 'react-i18next';

import { useSnackbar } from '../components/snack-bar/snackbar-provider';
import { logger } from '../logger/logger';
import { pickSingleFile } from '../utils/file-picker.utils';

export interface SingleFile {
  name: string;
  uri: string;
  size?: number;
  mimeType?: string;
  lastModified?: number;
}

interface UseSingleFileSelectorArgs {
  mimeTypes?: string[];
  copyToCacheDirectory?: boolean;
}

export const useSingleFileSelector = ({ mimeTypes, copyToCacheDirectory = false }: UseSingleFileSelectorArgs) => {
  const { t } = useTranslation();
  const { showSnackbarMessage } = useSnackbar();

  const [selectedFile, setSelectedFile] = useState<SingleFile>();

  const handleFileSelection = async () => {
    try {
      const type = mimeTypes ?? ['*/*'];
      const result = await pickSingleFile({ type, copyToCacheDirectory });
      if (!result.exists) return;

      const { name, size, uri, mimeType, lastModified } = result;
      if (uri && name) {
        setSelectedFile({ name, size, uri, lastModified, mimeType });
      }
    } catch (e: unknown) {
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
