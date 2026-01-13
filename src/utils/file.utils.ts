import { hasScheme, SCHEME_PREFIXES } from '@lichens-innovation/ts-common';

import { logger } from '../logger/logger';
import { nativeFileSystem } from '../services/files/native-file-system';
import { EncodingType } from '../services/files/native-file-system.types';

const DEFAULT_ENCODING = EncodingType.UTF8;
const DEFAULT_OPTIONS = { encoding: DEFAULT_ENCODING };

export const isFileExists = async (fileUri = '') => {
  const { exists } = await nativeFileSystem.getInfoAsync(fileUri);
  return exists;
};

export const getFilenameOnly = (fileUri = '/') => fileUri.split('/').pop();

export const getFileExtensionOnly = (fileUri = '/') => fileUri.split('.').pop()?.toLowerCase();

export const getDirectoryOnly = (fileUri = '/') => fileUri.substring(0, fileUri.lastIndexOf('/'));

export const getDocumentFolderRelativePath = (fileUri = '/') =>
  fileUri.substring(nativeFileSystem.documentDirectory?.length ?? 0);

export const getDocumentFullFilename = (filename = '') => nativeFileSystem.documentDirectory + filename;

export const createDirectoryStructure = async (folderUri = '') => {
  const exists = await isFileExists(folderUri);

  if (exists) {
    return { exists: true };
  }

  try {
    await nativeFileSystem.makeDirectoryAsync(folderUri, { intermediates: true });
    return { exists: true };
  } catch (error: unknown) {
    logger.error('createDirectoryStructure', error);
    return {
      exists: false,
      error,
    };
  }
};

export interface FileMutationResult {
  exists: boolean;
  error?: unknown;
}

export const saveTextContent = async ({ fileUri = '', text = '' }): Promise<FileMutationResult> => {
  try {
    await nativeFileSystem.writeAsStringAsync(fileUri, text, DEFAULT_OPTIONS);
    const exists = await isFileExists(fileUri);
    return { exists };
  } catch (error: unknown) {
    logger.error('saveTextContent', error);
    return {
      exists: false,
      error,
    };
  }
};

export interface LoadTextContentResult {
  exists: boolean;
  content?: string;
  error?: unknown;
}

export const loadTextContent = async (fileUri = ''): Promise<LoadTextContentResult> => {
  const exists = await isFileExists(fileUri);

  if (!exists) {
    return { exists };
  }

  try {
    const content = await nativeFileSystem.readAsStringAsync(fileUri, DEFAULT_OPTIONS);

    return {
      exists,
      content,
    };
  } catch (error: unknown) {
    logger.error('loadTextContent', error);
    return { exists, error };
  }
};

export const deleteFile = async (fileUri = ''): Promise<FileMutationResult> => {
  const exists = await isFileExists(fileUri);

  if (!exists) {
    return { exists };
  }

  try {
    await nativeFileSystem.deleteAsync(fileUri);
    return { exists };
  } catch (error: unknown) {
    logger.error('deleteFile', error);
    return { exists, error };
  }
};

export const nowAsIsoFilename = () => {
  const isoString = new Date().toISOString();

  // '2022-12-28T20:21:40.862Z' ==> '2022-12-28T20_21_40.862Z'
  return isoString.replace(new RegExp(':', 'g'), '_');
};

export const isFileUri = (uri: string): boolean => {
  if (!hasScheme(uri)) {
    return false;
  }

  try {
    return new URL(uri).protocol === `${SCHEME_PREFIXES.file}:`;
  } catch (e: unknown) {
    logger.debug(`[isFileUri] Invalid URI: [${uri}]`, e);
    return false;
  }
};

export const normalizeFileUri = (uri?: string | null): string => {
  if (!uri) {
    return '';
  }

  if (isFileUri(uri)) {
    return uri;
  }

  if (hasScheme(uri)) {
    logger.debug(`[normalizeFileUri] Non-file URI scheme provided: [${uri}]`);
    return '';
  }

  return `${SCHEME_PREFIXES.file}://${uri}`;
};
