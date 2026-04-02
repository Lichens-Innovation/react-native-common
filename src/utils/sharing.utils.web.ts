import { notImplementedYet } from './platform.utils';

export const shareTextFile = async (fileUri?: string) => {
  notImplementedYet(
    '[Sharing] shareTextFile — OS share sheet for a plain-text file is not implemented on web',
    fileUri
  );
};

export const shareXmlFile = async (fileUri?: string) => {
  notImplementedYet('[Sharing] shareXmlFile — OS share sheet for an XML file is not implemented on web', fileUri);
};

export const shareCurrentLogsFile = async (): Promise<void> => {
  notImplementedYet('[Sharing] shareCurrentLogsFile — sharing the active app log via the OS is not implemented on web');
};
