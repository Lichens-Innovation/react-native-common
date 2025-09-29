import { DeleteOptions, EncodingType, FileInfo, INativeFileSystem, MakeDirectoryOptions, ReadOptions, WriteOptions } from './native-file-system.types';
export declare class NativeFileSystem implements INativeFileSystem {
    readonly documentDirectory: string | null;
    readonly EncodingType: typeof EncodingType;
    writeAsStringAsync(fileUri: string, contents: string, options?: WriteOptions): Promise<void>;
    readAsStringAsync(fileUri: string, options?: ReadOptions): Promise<string>;
    getInfoAsync(fileUri: string): Promise<FileInfo>;
    copyContentUriToLocal(contentUri: string): Promise<string>;
    readDirectoryAsync(fileUri: string): Promise<string[]>;
    makeDirectoryAsync(fileUri: string, options?: MakeDirectoryOptions): Promise<void>;
    deleteAsync(fileUri: string, options?: DeleteOptions): Promise<void>;
    private mapEncodingToExpo;
}
export declare const nativeFileSystem: NativeFileSystem;
