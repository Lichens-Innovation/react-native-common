import { Buffer } from 'buffer';
import { Directory, File, Paths } from 'expo-file-system';
import { logger } from '../../logger/logger';
import { getErrorMessage } from '../../utils/errors.utils';
import {
  EncodingType,
  FileInfo,
  INativeFileSystem,
  MakeDirectoryOptions,
  ReadOptions,
  WriteOptions
} from './native-file-system.types';

export class NativeFileSystem implements INativeFileSystem {
  public readonly documentDirectory: string | null = Paths.document.uri;
  public readonly cacheDirectory: string | null = Paths.cache.uri;

  public readonly EncodingType = EncodingType;

  async writeAsStringAsync(fileUri: string, contents: string, options?: WriteOptions): Promise<void> {
    const file = new File(fileUri);

    // for base64 encoding, pass the base64 string directly
    if (options?.encoding === EncodingType.Base64) {
      file.write(contents, { encoding: 'base64' });
      return;
    }

    // Default to UTF-8 string
    file.write(contents, { encoding: 'utf8' });
  }

  async readAsStringAsync(fileUri: string, options?: ReadOptions): Promise<string> {
    const file = new File(fileUri);

    if (options?.encoding === EncodingType.Base64) {
      const bytes = await file.bytes();
      return Buffer.from(bytes).toString('base64');
    }

    // default to UTF-8 text
    return file.textSync();
  }

  async getInfoAsync(fileUri: string): Promise<FileInfo> {
    const pathInfo = Paths.info(fileUri);

    if (pathInfo.isDirectory) {
      const directory = new Directory(fileUri);
      const info = directory.info();
      return {
        exists: info.exists,
        isDirectory: true,
        size: info.size,
        modificationTime: info.modificationTime,
        uri: fileUri,
      };
    }

    const file = new File(fileUri);
    const info = file.info();
    return {
      exists: info.exists,
      isDirectory: false,
      size: info.size,
      modificationTime: info.modificationTime,
      uri: fileUri,
    };
  }

  async copyContentUriToLocal(contentUri: string, fileName: string): Promise<string> {
    logger.info(`[copyContentUriToLocal] Copying content uri to local file: ${fileName}`);

    try {
      const localUri = `${Paths.document.uri}${fileName}`;
      const sourceFile = new File(contentUri);
      const destFile = new File(localUri);
      sourceFile.copy(destFile);
      logger.info(`[copyContentUriToLocal] Copy successful: ${localUri}`);
      return localUri;
    } catch (e: unknown) {
      logger.error(`[copyContentUriToLocal] Copy failed: ${getErrorMessage(e)}`, e);
      throw e;
    }
  }

  async readDirectoryAsync(fileUri: string): Promise<string[]> {
    const directory = new Directory(fileUri);
    const contents = directory.list();
    return contents.map((item) => item.name);
  }

  async makeDirectoryAsync(fileUri: string, options?: MakeDirectoryOptions): Promise<void> {
    const directory = new Directory(fileUri);
    const intermediates = options?.intermediates ?? false;
    directory.create({ intermediates });
  }

  async deleteAsync(fileUri: string): Promise<void> {
    const pathInfo = Paths.info(fileUri);

    if (!pathInfo.exists) {
      logger.warn(`[deleteAsync] Path does not exist: ${fileUri}`);
      return;
    }

    if (pathInfo.isDirectory) {
      const directory = new Directory(fileUri);
      directory.delete();
    } else {
      const file = new File(fileUri);
      file.delete();
    }
  }
}

export const nativeFileSystem = new NativeFileSystem();
