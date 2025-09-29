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
export declare const MIN_WIFI_PASSWORD_LENGTH = 8;
export declare const RV_CAM_NETWORK_SSID_REGEX: RegExp;
export declare const RINNO_CAM_NETWORK_SSID_REGEX: RegExp;
export declare const DEFAULT_CONNECT_WIFI_TIMEOUT: number;
export declare const isRinnoNormalizedSSID: (ssid?: string) => boolean;
export declare const getRVMaxWiFiDefaultPassword: (ssid?: string | null) => string;
export declare const toWifiInfoArray: (networks: WifiEntry[]) => WifiInfo[];
export declare const isRvCamNetwork: (ssid: string) => boolean;
export declare const wifiNetworkComparator: (a: WifiInfo, b: WifiInfo) => number;
export {};
