import { EncodingType, } from './native-file-system.types';
export class NativeFileSystemWindows {
    constructor() {
        this.documentDirectory = null;
        this.EncodingType = EncodingType;
    }
    async writeAsStringAsync(fileUri, contents, options) {
        throw new Error('NativeFileSystemWindows: writeAsStringAsync not implemented for Windows platform');
    }
    async readAsStringAsync(fileUri, options) {
        throw new Error('NativeFileSystemWindows: readAsStringAsync not implemented for Windows platform');
    }
    async getInfoAsync(fileUri) {
        throw new Error('NativeFileSystemWindows: getInfoAsync not implemented for Windows platform');
    }
    async readDirectoryAsync(fileUri) {
        throw new Error('NativeFileSystemWindows: readDirectoryAsync not implemented for Windows platform');
    }
    async makeDirectoryAsync(fileUri, options) {
        throw new Error('NativeFileSystemWindows: makeDirectoryAsync not implemented for Windows platform');
    }
    async deleteAsync(fileUri, options) {
        throw new Error('NativeFileSystemWindows: deleteAsync not implemented for Windows platform');
    }
    async copyContentUriToLocal(contentUri) {
        throw new Error('NativeFileSystemWindows: copyContentUriToLocal not implemented for Windows platform');
    }
}
export const nativeFileSystem = new NativeFileSystemWindows();
//# sourceMappingURL=native-file-system.windows.js.map