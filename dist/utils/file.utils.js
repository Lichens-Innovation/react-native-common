import { logger } from '../logger/logger';
import { nativeFileSystem } from '../services/files/native-file-system';
import { EncodingType } from '../services/files/native-file-system.types';
const DEFAULT_ENCODING = EncodingType.UTF8;
const DEFAULT_OPTIONS = { encoding: DEFAULT_ENCODING };
export const isFileExists = async (fileUri = '') => {
    const { exists } = await nativeFileSystem.getInfoAsync(fileUri);
    return exists;
};
export const getFilenameOnly = (fileUri = '/') => fileUri.split('/').pop();
export const getFileExtensionOnly = (fileUri = '/') => { var _a; return (_a = fileUri.split('.').pop()) === null || _a === void 0 ? void 0 : _a.toLowerCase(); };
export const getDirectoryOnly = (fileUri = '/') => fileUri.substring(0, fileUri.lastIndexOf('/'));
export const getDocumentFolderRelativePath = (fileUri = '/') => { var _a, _b; return fileUri.substring((_b = (_a = nativeFileSystem.documentDirectory) === null || _a === void 0 ? void 0 : _a.length) !== null && _b !== void 0 ? _b : 0); };
export const getDocumentFullFilename = (filename = '') => nativeFileSystem.documentDirectory + filename;
export const createDirectoryStructure = async (folderUri = '') => {
    const exists = await isFileExists(folderUri);
    if (exists) {
        return { exists: true };
    }
    try {
        await nativeFileSystem.makeDirectoryAsync(folderUri, { intermediates: true });
        return { exists: true };
    }
    catch (error) {
        logger.error('createDirectoryStructure', error);
        return {
            exists: false,
            error,
        };
    }
};
export const saveTextContent = async ({ fileUri = '', text = '' }) => {
    try {
        await nativeFileSystem.writeAsStringAsync(fileUri, text, DEFAULT_OPTIONS);
        const exists = await isFileExists(fileUri);
        return { exists };
    }
    catch (error) {
        logger.error('saveTextContent', error);
        return {
            exists: false,
            error,
        };
    }
};
export const loadTextContent = async (fileUri = '') => {
    const exists = await isFileExists(fileUri);
    if (!exists) {
        return { exists };
    }
    try {
        const content = await nativeFileSystem.readAsStringAsync(fileUri, DEFAULT_OPTIONS);
        return {
            exists,
            content,
        };
    }
    catch (error) {
        logger.error('loadTextContent', error);
        return { exists, error };
    }
};
export const deleteFile = async (fileUri = '') => {
    const exists = await isFileExists(fileUri);
    if (!exists) {
        return { exists };
    }
    try {
        await nativeFileSystem.deleteAsync(fileUri);
        return { exists };
    }
    catch (error) {
        logger.error('deleteFile', error);
        return { exists, error };
    }
};
export const nowAsIsoFilename = () => {
    const isoString = new Date().toISOString();
    // '2022-12-28T20:21:40.862Z' ==> '2022-12-28T20_21_40.862Z'
    return isoString.replace(new RegExp(':', 'g'), '_');
};
export const isFileUri = (uri) => {
    return !!uri && new URL(uri).protocol === 'file:';
};
//# sourceMappingURL=file.utils.js.map