import { INativeFileSystem, FileInfo, EncodingType, WriteOptions, ReadOptions, MakeDirectoryOptions, DeleteOptions } from './native-file-system.types';
export declare class NativeFileSystemWindows implements INativeFileSystem {
    readonly documentDirectory: string | null;
    readonly EncodingType: typeof EncodingType;
    writeAsStringAsync(fileUri: string, contents: string, options?: WriteOptions): Promise<void>;
    readAsStringAsync(fileUri: string, options?: ReadOptions): Promise<string>;
    getInfoAsync(fileUri: string): Promise<FileInfo>;
    readDirectoryAsync(fileUri: string): Promise<string[]>;
    makeDirectoryAsync(fileUri: string, options?: MakeDirectoryOptions): Promise<void>;
    deleteAsync(fileUri: string, options?: DeleteOptions): Promise<void>;
    copyContentUriToLocal(contentUri: string): Promise<string>;
}
export declare const nativeFileSystem: NativeFileSystemWindows;
