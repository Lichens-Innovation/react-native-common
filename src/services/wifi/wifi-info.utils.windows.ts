import { notImplementedYet } from '../../utils/platform.utils';
import { WifiInfo } from './wifi-info.types';

export const fetchWifiInfo = async (): Promise<WifiInfo> => {
  notImplementedYet(
    '[Wi‑Fi] fetchWifiInfo — reading SSID, signal strength and IP via react-native-wifi-reborn is not implemented on Windows desktop',
  );
  throw new Error('fetchWifiInfo is not implemented for Windows');
};
