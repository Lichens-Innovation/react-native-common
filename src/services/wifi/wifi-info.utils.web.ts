import { notImplementedYet } from '../../utils/platform.utils';
import { DEFAULT_CONNECT_WIFI_TIMEOUT, WifiInfo } from './wifi-info.types';

export const isDisconnectedOrConnecting = (e: unknown): e is Error => {
  return e instanceof Error && e.message.toLowerCase().includes('not connected or connecting');
};

export const isUnexpectedWifiConnectionError = (e?: unknown): boolean => {
  return !!e && !isDisconnectedOrConnecting(e);
};

export const fetchWifiInfo = async (): Promise<WifiInfo> => {
  notImplementedYet(
    '[Wi‑Fi] fetchWifiInfo — reading SSID, signal strength and IP via react-native-wifi-reborn is not implemented on web'
  );
  throw new Error('fetchWifiInfo is not implemented on web');
};

export interface ConnectToWiFiArgs {
  ssid: string;
  password: string;
  isWEP?: boolean;
  isHidden?: boolean;
  timeout?: number;
}

export const connectToWiFi = async (args: ConnectToWiFiArgs) => {
  const { ssid, isWEP = false, isHidden = false, timeout = DEFAULT_CONNECT_WIFI_TIMEOUT } = args;
  notImplementedYet(
    '[Wi‑Fi] connectToWiFi — joining a protected Wi‑Fi network from the browser is not implemented on web',
    { ssid, isWEP, isHidden, timeout }
  );
  throw new Error('connectToWiFi is not implemented on web');
};

export const disconnectFromWiFi = async (): Promise<void> => {
  notImplementedYet('[Wi‑Fi] disconnectFromWiFi — disconnecting the current Wi‑Fi network is not implemented on web');
  throw new Error('disconnectFromWiFi is not implemented on web');
};

export const fetchAvailableWifiList = async (): Promise<WifiInfo[]> => {
  notImplementedYet('[Wi‑Fi] fetchAvailableWifiList — scanning surrounding Wi‑Fi networks is not implemented on web');
  return [];
};

export const requestLocationPermission = async (): Promise<void> => {
  notImplementedYet(
    '[Wi‑Fi] requestLocationPermission — foreground location permission for Wi‑Fi APIs is not implemented on web'
  );
  throw new Error('Location permission not granted on web');
};
