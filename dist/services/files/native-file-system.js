import { format } from 'date-fns';
import * as FileSystem from 'expo-file-system';
import { logger } from '../../logger/logger';
import { getErrorMessage } from '../../utils/errors.utils';
import { EncodingType, } from './native-file-system.types';
export class NativeFileSystem {
    constructor() {
        this.documentDirectory = FileSystem.documentDirectory;
        this.EncodingType = EncodingType;
    }
    async writeAsStringAsync(fileUri, contents, options) {
        const expoOptions = {};
        if (options === null || options === void 0 ? void 0 : options.encoding) {
            expoOptions.encoding = this.mapEncodingToExpo(options.encoding);
        }
        await FileSystem.writeAsStringAsync(fileUri, contents, expoOptions);
    }
    async readAsStringAsync(fileUri, options) {
        const expoOptions = {};
        if (options === null || options === void 0 ? void 0 : options.encoding) {
            expoOptions.encoding = this.mapEncodingToExpo(options.encoding);
        }
        return await FileSystem.readAsStringAsync(fileUri, expoOptions);
    }
    async getInfoAsync(fileUri) {
        const info = await FileSystem.getInfoAsync(fileUri);
        return {
            exists: info.exists,
            isDirectory: info.isDirectory,
            size: 'size' in info ? info.size : undefined,
            modificationTime: 'modificationTime' in info ? info.modificationTime : undefined,
            uri: fileUri,
        };
    }
    async copyContentUriToLocal(contentUri) {
        const fileName = `ion_fw_${format(new Date(), 'yyyy-MM-dd_HH-mm-ss')}.bin`;
        const localUri = `${FileSystem.documentDirectory}${fileName}`;
        logger.info(`[copyContentUriToLocal] Copying content uri to local file: ${fileName}`);
        try {
            await FileSystem.copyAsync({ from: contentUri, to: localUri });
            logger.info(`[copyContentUriToLocal] Copy successful: ${localUri}`);
            return localUri;
        }
        catch (e) {
            logger.error(`[copyContentUriToLocal] Copy failed: ${getErrorMessage(e)}`, e);
            throw e;
        }
    }
    async readDirectoryAsync(fileUri) {
        return await FileSystem.readDirectoryAsync(fileUri);
    }
    async makeDirectoryAsync(fileUri, options) {
        var _a;
        await FileSystem.makeDirectoryAsync(fileUri, {
            intermediates: (_a = options === null || options === void 0 ? void 0 : options.intermediates) !== null && _a !== void 0 ? _a : false,
        });
    }
    async deleteAsync(fileUri, options) {
        var _a;
        await FileSystem.deleteAsync(fileUri, {
            idempotent: (_a = options === null || options === void 0 ? void 0 : options.idempotent) !== null && _a !== void 0 ? _a : false,
        });
    }
    mapEncodingToExpo(encoding) {
        switch (encoding) {
            case EncodingType.UTF8:
                return FileSystem.EncodingType.UTF8;
            case EncodingType.Base64:
                return FileSystem.EncodingType.Base64;
            default:
                return FileSystem.EncodingType.UTF8;
        }
    }
}
export const nativeFileSystem = new NativeFileSystem();
//# sourceMappingURL=native-file-system.js.map