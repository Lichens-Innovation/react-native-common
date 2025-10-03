import { Linking } from 'react-native';
import { logger } from '../logger/logger';

export const openWifiSettings = async () => {
  try {
    await Linking.openURL('android.settings.WIFI_SETTINGS');
  } catch (e) {
    logger.error('[openWifiSettings] Error opening Android Wi-Fi settings:', e);
  }
};
