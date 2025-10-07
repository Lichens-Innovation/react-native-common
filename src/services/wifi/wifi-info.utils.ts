import * as Location from 'expo-location';
import { Platform } from 'react-native';
import WifiManager from 'react-native-wifi-reborn';
import { logger } from '../../logger/logger';
import { isRealDevice } from '../../utils/device.utils';
import { DEFAULT_CONNECT_WIFI_TIMEOUT, toWifiInfoArray, WifiInfo } from './wifi-info.types';
import { fetchAvailableWifiListSimulator, fetchWifiInfosSimulator } from './wifi-info.utils.simulator';

export const fetchWifiInfo = async (): Promise<WifiInfo> => {
  if (!isRealDevice()) {
    return fetchWifiInfosSimulator();
  }

  try {
    await requestLocationPermission();

    logger.info('[fetchWifiInfo] calling WifiManager.getCurrentWifiSSID');
    const [ssid, signalStrength, ip] = await Promise.all([
      WifiManager.getCurrentWifiSSID(),
      // the following methods are not implemented on all platforms:
      WifiManager.getCurrentSignalStrength?.(),
      WifiManager.getIP?.(),
    ]);

    return {
      ssid,
      signalStrength: Math.abs(signalStrength ?? 0),
      ip: ip ?? '',
    };
  } catch (e: unknown) {
    if (isDisconnectedOrConnecting(e)) {
      logger.info('[fetchWifiInfo] Cannot fetch WiFi info since state is either disconnected or connecting');
    } else {
      logger.error('[fetchWifiInfo] Error fetching WiFi info', e);
    }
    throw e;
  }
};

export const isDisconnectedOrConnecting = (e: unknown): e is Error => {
  return e instanceof Error && e.message.toLowerCase().includes('not connected or connecting');
};

export const isUnexpectedWifiConnectionError = (e?: unknown): boolean => {
  return !!e && !isDisconnectedOrConnecting(e);
};

export interface ConnectToWiFiArgs {
  ssid: string;
  password: string;
  isWEP?: boolean;
  isHidden?: boolean;
  timeout?: number;
}
export const connectToWiFi = async ({
  ssid,
  password,
  isWEP = false,
  isHidden = false,
  timeout = DEFAULT_CONNECT_WIFI_TIMEOUT,
}: ConnectToWiFiArgs) => {
  try {
    logger.info(`[connectToWiFi] attempting to connect to WiFi ${ssid}`);
    await WifiManager.connectToProtectedWifiSSID({ ssid, password, isWEP, isHidden, timeout });
    logger.info(`[connectToWiFi] Connected to WiFi ${ssid}`);
  } catch (e: unknown) {
    logger.info(`[connectToWiFi] Unable to connect to WiFi ${ssid}`, e); // perhaps bad password
    throw e;
  }
};

export const disconnectFromWiFi = async (): Promise<void> => {
  logger.info('[disconnectFromWiFi]: disconnecting from WiFi');

  try {
    const ssid = await WifiManager.getCurrentWifiSSID();
    logger.info(`[disconnectFromWiFi]: Current WiFi SSID: ${ssid}`);

    if (Platform.OS === 'ios') {
      await WifiManager.disconnectFromSSID(ssid);
    } else if (Platform.OS === 'android') {
      const result = await WifiManager.disconnect();
      logger.info(`[disconnectFromWiFi]: Disconnected from WiFi result: ${result}`);
    } else {
      logger.info(`[disconnectFromWiFi]: Unsupported platform: ${Platform.OS}`);
    }

    logger.info('[disconnectFromWiFi]: Disconnected from WiFi ended.');
  } catch (e: unknown) {
    logger.error('[disconnectFromWiFi]: Error disconnecting from WiFi', e);
    throw e;
  }
};

export const fetchAvailableWifiList = async (): Promise<WifiInfo[]> => {
  if (!isRealDevice()) {
    return fetchAvailableWifiListSimulator();
  }

  if (Platform.OS === 'ios') {
    // Apple does not allow third-party apps to scan surrounding WiFi networks.
    logger.info('[fetchAvailableWifiList] returning empty array for iOS');
    return [];
  }

  try {
    await requestLocationPermission();

    logger.info('[fetchAvailableWifiList] calling WifiManager.loadWifiList');
    const networks = await WifiManager.loadWifiList();
    if (Array.isArray(networks)) {
      return toWifiInfoArray(networks);
    }

    logger.info('[fetchAvailableWifiList] 2nd try: calling WifiManager.reScanAndLoadWifiList');
    const networks2ndTry = await WifiManager.reScanAndLoadWifiList();
    return toWifiInfoArray(networks2ndTry);
  } catch (e: unknown) {
    logger.error('[fetchAvailableWifiList] Error fetching available WiFi list', e);
    throw e;
  }
};

export const requestLocationPermission = async (): Promise<void> => {
  const currentStatus = await Location.getForegroundPermissionsAsync();
  if (currentStatus.status === 'granted') {
    return;
  }

  logger.info('[requestLocationPermission] requesting location permission');
  const { status } = await Location.requestForegroundPermissionsAsync();
  logger.info(`[requestLocationPermission] location permission requested, result: ${status}`);

  if (status !== 'granted') {
    throw new Error(`Location permission not granted: ${status}`);
  }
};
