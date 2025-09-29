import * as Sharing from 'expo-sharing';
import i18next from 'i18next';
import { Platform } from 'react-native';
import { loadCurrentLogsFileUri, logger } from '../logger/logger';
const buildShareOptionsFromMimeType = (mimeType) => {
    if (!mimeType) {
        return {};
    }
    const dialogTitle = i18next.t('common:share');
    if (mimeType === 'text/plain') {
        return Platform.select({
            ios: { mimeType: 'public.plain-text', UTI: 'public.plain-text' },
            default: { dialogTitle, mimeType },
        });
    }
    if (['application/xml', 'text/xml'].includes(mimeType)) {
        return Platform.select({
            ios: { mimeType: 'application/xml', UTI: 'public.xml' },
            default: { dialogTitle, mimeType },
        });
    }
    return {};
};
export const shareTextFile = async (fileUri) => {
    return shareFile({ fileUri, mimeType: 'text/plain' });
};
export const shareXmlFile = async (fileUri) => {
    return shareFile({ fileUri, mimeType: 'application/xml' });
};
export const shareFile = async ({ fileUri, mimeType }) => {
    if (!fileUri) {
        return;
    }
    const isAvailable = await Sharing.isAvailableAsync();
    if (!isAvailable) {
        logger.warn('Sharing is not available on this device');
        return;
    }
    const options = buildShareOptionsFromMimeType(mimeType);
    Sharing.shareAsync(fileUri, options).catch((e) => {
        logger.error(`Error while sharing file [${fileUri}] of type ${mimeType}`, e);
    });
};
export const shareCurrentLogsFile = async () => {
    const logsFileUri = await loadCurrentLogsFileUri();
    return shareTextFile(logsFileUri);
};
//# sourceMappingURL=sharing.utils.js.map