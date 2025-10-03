import { Linking, Platform } from 'react-native';
import { logger } from '../logger/logger';

export const openWifiSettings = async () => {
  if (Platform.OS === 'ios') {
    return openWifiSettingsIos();
  }

  if (Platform.OS === 'android') {
    return openWifiSettingsAndroid();
  }

  logger.warn(`[openWifiSettings] is not supported on this platform: ${Platform.OS}`);
};

export const openWifiSettingsIos = async () => {
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

export const openWifiSettingsAndroid = async () => {
  try {
    await Linking.openURL('android.settings.WIFI_SETTINGS');
  } catch (e) {
    logger.error('[openWifiSettings] Error opening Android Wi-Fi settings:', e);
  }
};
