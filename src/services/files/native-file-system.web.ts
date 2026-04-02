import {
  INativeFileSystem,
  FileInfo,
  EncodingType,
  WriteOptions,
  ReadOptions,
  MakeDirectoryOptions,
  DeleteOptions,
} from './native-file-system.types';

export class NativeFileSystemWeb implements INativeFileSystem {
  public readonly documentDirectory: string | null = null;
  public readonly cacheDirectory: string | null = null;
  public readonly EncodingType = EncodingType;

  async writeAsStringAsync(_fileUri: string, _contents: string, _options?: WriteOptions): Promise<void> {
    throw new Error('NativeFileSystemWeb: writeAsStringAsync is not implemented on web');
  }

  async readAsStringAsync(_fileUri: string, _options?: ReadOptions): Promise<string> {
    throw new Error('NativeFileSystemWeb: readAsStringAsync is not implemented on web');
  }

  async getInfoAsync(_fileUri: string): Promise<FileInfo> {
    throw new Error('NativeFileSystemWeb: getInfoAsync is not implemented on web');
  }

  async readDirectoryAsync(_fileUri: string): Promise<string[]> {
    throw new Error('NativeFileSystemWeb: readDirectoryAsync is not implemented on web');
  }

  async makeDirectoryAsync(_fileUri: string, _options?: MakeDirectoryOptions): Promise<void> {
    throw new Error('NativeFileSystemWeb: makeDirectoryAsync is not implemented on web');
  }

  async deleteAsync(_fileUri: string, _options?: DeleteOptions): Promise<void> {
    throw new Error('NativeFileSystemWeb: deleteAsync is not implemented on web');
  }

  async copyContentUriToLocal(_contentUri: string): Promise<string> {
    throw new Error('NativeFileSystemWeb: copyContentUriToLocal is not implemented on web');
  }
}

export const nativeFileSystem = new NativeFileSystemWeb();
