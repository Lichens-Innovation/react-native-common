export interface FileInfo {
  exists: boolean;
  isDirectory?: boolean;
  size?: number;
  modificationTime?: number;
  uri: string;
}

export interface DirectoryInfo {
  exists: boolean;
  isDirectory: boolean;
  uri: string;
}

export enum EncodingType {
  UTF8 = 'utf8',
  Base64 = 'base64',
}

export interface WriteOptions {
  encoding?: EncodingType;
}

export interface ReadOptions {
  encoding?: EncodingType;
}

export interface MakeDirectoryOptions {
  intermediates?: boolean;
}

export interface DeleteOptions {
  idempotent?: boolean;
}

export interface INativeFileSystem {
  readonly documentDirectory: string | null;
  readonly EncodingType: typeof EncodingType;

  writeAsStringAsync(fileUri: string, contents: string, options?: WriteOptions): Promise<void>;
  readAsStringAsync(fileUri: string, options?: ReadOptions): Promise<string>;

  getInfoAsync(fileUri: string): Promise<FileInfo>;

  readDirectoryAsync(fileUri: string): Promise<string[]>;
  makeDirectoryAsync(fileUri: string, options?: MakeDirectoryOptions): Promise<void>;

  deleteAsync(fileUri: string, options?: DeleteOptions): Promise<void>;
}
