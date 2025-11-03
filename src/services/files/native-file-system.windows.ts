import {
  INativeFileSystem,
  FileInfo,
  EncodingType,
  WriteOptions,
  ReadOptions,
  MakeDirectoryOptions,
  DeleteOptions,
} from './native-file-system.types';

export class NativeFileSystemWindows implements INativeFileSystem {
  public readonly documentDirectory: string | null = null;
  public readonly cacheDirectory: string | null = null;
  public readonly EncodingType = EncodingType;

  async writeAsStringAsync(fileUri: string, contents: string, options?: WriteOptions): Promise<void> {
    throw new Error('NativeFileSystemWindows: writeAsStringAsync not implemented for Windows platform');
  }

  async readAsStringAsync(fileUri: string, options?: ReadOptions): Promise<string> {
    throw new Error('NativeFileSystemWindows: readAsStringAsync not implemented for Windows platform');
  }

  async getInfoAsync(fileUri: string): Promise<FileInfo> {
    throw new Error('NativeFileSystemWindows: getInfoAsync not implemented for Windows platform');
  }

  async readDirectoryAsync(fileUri: string): Promise<string[]> {
    throw new Error('NativeFileSystemWindows: readDirectoryAsync not implemented for Windows platform');
  }

  async makeDirectoryAsync(fileUri: string, options?: MakeDirectoryOptions): Promise<void> {
    throw new Error('NativeFileSystemWindows: makeDirectoryAsync not implemented for Windows platform');
  }

  async deleteAsync(fileUri: string, options?: DeleteOptions): Promise<void> {
    throw new Error('NativeFileSystemWindows: deleteAsync not implemented for Windows platform');
  }

  async copyContentUriToLocal(contentUri: string): Promise<string> {
    throw new Error('NativeFileSystemWindows: copyContentUriToLocal not implemented for Windows platform');
  }
}

export const nativeFileSystem = new NativeFileSystemWindows();
