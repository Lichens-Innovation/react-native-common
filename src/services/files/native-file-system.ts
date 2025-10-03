import { format } from 'date-fns';
import * as FileSystem from 'expo-file-system/legacy';
import { logger } from '../../logger/logger';
import { getErrorMessage } from '../../utils/errors.utils';
import {
  DeleteOptions,
  EncodingType,
  FileInfo,
  INativeFileSystem,
  MakeDirectoryOptions,
  ReadOptions,
  WriteOptions,
} from './native-file-system.types';

export class NativeFileSystem implements INativeFileSystem {
  public readonly documentDirectory: string | null = FileSystem.documentDirectory;
  public readonly EncodingType = EncodingType;

  async writeAsStringAsync(fileUri: string, contents: string, options?: WriteOptions): Promise<void> {
    const expoOptions: FileSystem.WritingOptions = {};

    if (options?.encoding) {
      expoOptions.encoding = this.mapEncodingToExpo(options.encoding);
    }

    await FileSystem.writeAsStringAsync(fileUri, contents, expoOptions);
  }

  async readAsStringAsync(fileUri: string, options?: ReadOptions): Promise<string> {
    const expoOptions: FileSystem.ReadingOptions = {};

    if (options?.encoding) {
      expoOptions.encoding = this.mapEncodingToExpo(options.encoding);
    }

    return await FileSystem.readAsStringAsync(fileUri, expoOptions);
  }

  async getInfoAsync(fileUri: string): Promise<FileInfo> {
    const info = await FileSystem.getInfoAsync(fileUri);

    return {
      exists: info.exists,
      isDirectory: info.isDirectory,
      size: 'size' in info ? info.size : undefined,
      modificationTime: 'modificationTime' in info ? info.modificationTime : undefined,
      uri: fileUri,
    };
  }

  async copyContentUriToLocal(contentUri: string): Promise<string> {
    const fileName = `ion_fw_${format(new Date(), 'yyyy-MM-dd_HH-mm-ss')}.bin`;
    const localUri = `${FileSystem.documentDirectory}${fileName}`;

    logger.info(`[copyContentUriToLocal] Copying content uri to local file: ${fileName}`);

    try {
      await FileSystem.copyAsync({ from: contentUri, to: localUri });
      logger.info(`[copyContentUriToLocal] Copy successful: ${localUri}`);
      return localUri;
    } catch (e: unknown) {
      logger.error(`[copyContentUriToLocal] Copy failed: ${getErrorMessage(e)}`, e);
      throw e;
    }
  }

  async readDirectoryAsync(fileUri: string): Promise<string[]> {
    return await FileSystem.readDirectoryAsync(fileUri);
  }

  async makeDirectoryAsync(fileUri: string, options?: MakeDirectoryOptions): Promise<void> {
    await FileSystem.makeDirectoryAsync(fileUri, {
      intermediates: options?.intermediates ?? false,
    });
  }

  async deleteAsync(fileUri: string, options?: DeleteOptions): Promise<void> {
    await FileSystem.deleteAsync(fileUri, {
      idempotent: options?.idempotent ?? false,
    });
  }

  private mapEncodingToExpo(encoding: EncodingType): FileSystem.EncodingType {
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
