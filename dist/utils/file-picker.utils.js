import * as DocumentPicker from 'expo-document-picker';
import { logger } from '../logger/logger';
const DEFAULT_FILE_PICKER_OPTIONS = { type: ['*/*'], copyToCacheDirectory: true };
export const pickSingleFile = async (options = DEFAULT_FILE_PICKER_OPTIONS) => {
    try {
        const result = await DocumentPicker.getDocumentAsync(options);
        if (result.canceled) {
            return { exists: false, error: 'canceled', name: '', uri: '', size: 0, mimeType: '', lastModified: 0 };
        }
        const singleAsset = result.assets[0];
        return Object.assign({ exists: singleAsset.uri && singleAsset.name }, singleAsset);
    }
    catch (error) {
        logger.error('pickSingleFile', error);
        return { error, exists: false };
    }
};
//# sourceMappingURL=file-picker.utils.js.map