import Clipboard from '@react-native-clipboard/clipboard';
import { logger } from '../logger/logger';

export const setClipboardTextContent = async (value: string = ''): Promise<void> => {
  try {
    logger.info('[setClipboardTextContent] setting value', `${value.substring(0, 20)}...`);
    Clipboard.setString(value);
  } catch (e: unknown) {
    logger.error('[setClipboardTextContent] error', e);
  }
};
