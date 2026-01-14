import { PeriodsInMS } from '@lichens-innovation/ts-common';

export interface WifiInfo {
  signalStrength: number;
  ssid: string;
  bssid?: string;
  capabilities?: string;
  frequency?: number;
  timestamp?: number;
  isHidden?: boolean;
  ip?: string;
}

interface WifiEntry {
  SSID: string;
  BSSID: string;
  capabilities: string;
  frequency: number;
  level: number;
  timestamp: number;
}

export const DEFAULT_CONNECT_WIFI_TIMEOUT = 10 * PeriodsInMS.oneSecond;

export const toWifiInfoArray = (networks: WifiEntry[]): WifiInfo[] => {
  if (!Array.isArray(networks)) {
    return [];
  }

  return [...networks].map(toWifiInfo);
};

export const toWifiInfo = (network: WifiEntry): WifiInfo => {
  const { SSID, BSSID, level, capabilities, frequency, timestamp } = network;

  return {
    ssid: SSID,
    bssid: BSSID,
    signalStrength: Math.abs(level),
    capabilities,
    frequency,
    timestamp,
    isHidden: SSID === '(hidden SSID)',
  };
};
