import { getErrorMessage } from '@lichens-innovation/ts-common';
import { Buffer } from 'buffer';
import { Directory, File, Paths } from 'expo-file-system';
import * as FileSystemLegacy from 'expo-file-system/legacy';

import { logger } from '../../logger/logger';
import {
  EncodingType,
  FileInfo,
  INativeFileSystem,
  MakeDirectoryOptions,
  ReadOptions,
  WriteOptions,
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

  async readAsBase64Async(fileUri: string): Promise<string> {
    return this.readAsStringAsync(fileUri, { encoding: EncodingType.Base64 });
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
      // The new Expo SDK 54 API doesn't support content URIs
      // We need to use the legacy API for copying content URIs correctly
      await FileSystemLegacy.copyAsync({ from: contentUri, to: localUri });
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
