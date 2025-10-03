import { Linking } from 'react-native';
import { logger } from '../logger/logger';

export const openWifiSettings = async () => {
  const url = 'App-Prefs:root=WIFI';

  try {
    const canOpen = await Linking.canOpenURL(url);
    if (canOpen) {
      return Linking.openURL(url);
    }
  } catch (e) {
    logger.error('[openWifiSettings] error opening iOS Wi-Fi settings', e);
  }

  return Linking.openSettings();
};
