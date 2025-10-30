import * as Sharing from 'expo-sharing';
import i18next from 'i18next';
import { Platform } from 'react-native';
import { loadCurrentLogsFileUri, logger } from '../logger/logger';
import { isFileUri } from './file.utils';

const buildShareOptionsFromMimeType = (mimeType?: string): Sharing.SharingOptions => {
  if (!mimeType) {
    return {};
  }

  const dialogTitle = i18next.t('common:share');

  if (mimeType === 'text/plain') {
    return Platform.select({
      ios: { mimeType: 'public.plain-text', UTI: 'public.plain-text' },
      default: { dialogTitle, mimeType },
    }) as Sharing.SharingOptions;
  }

  if (['application/xml', 'text/xml'].includes(mimeType)) {
    return Platform.select({
      ios: { mimeType: 'application/xml', UTI: 'public.xml' },
      default: { dialogTitle, mimeType },
    }) as Sharing.SharingOptions;
  }

  return {};
};

export const shareTextFile = async (fileUri?: string) => {
  return shareFile({ fileUri, mimeType: 'text/plain' });
};

export const shareXmlFile = async (fileUri?: string) => {
  return shareFile({ fileUri, mimeType: 'application/xml' });
};

interface ShareFileArgs {
  fileUri?: string;
  mimeType?: string;
}

export const shareFile = async ({ fileUri, mimeType }: ShareFileArgs): Promise<void> => {
  if (!fileUri) {
    return;
  }

  const isAvailable = await Sharing.isAvailableAsync();
  if (!isAvailable) {
    logger.warn('Sharing is not available on this device');
    return;
  }

  const options = buildShareOptionsFromMimeType(mimeType);
  const normalizedFileUri = normalizeFileUri(fileUri);
  logger.info(`Sharing file [${normalizedFileUri}] of type ${mimeType}...`);

  Sharing.shareAsync(normalizedFileUri, options).catch((e: unknown) => {
    logger.error(`Error while sharing file [${normalizedFileUri}] of type ${mimeType}`, e);
  });
};

const normalizeFileUri = (fileUri: string) => {
  if (!fileUri) {
    return '';
  }

  return isFileUri(fileUri) ? fileUri : `file://${fileUri}`;
};

export const shareCurrentLogsFile = async (): Promise<void> => {
  const logsFileUri = await loadCurrentLogsFileUri();
  return shareTextFile(logsFileUri);
};
