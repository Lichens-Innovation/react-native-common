import { WifiInfo } from './wifi-info.types';
export declare const fetchWifiInfo: () => Promise<WifiInfo>;
export declare const isDisconnectedOrConnecting: (e: unknown) => e is Error;
export declare const isUnexpectedWifiConnectionError: (e?: unknown) => boolean;
export interface ConnectToWiFiArgs {
    ssid: string;
    password: string;
    isWEP?: boolean;
    isHidden?: boolean;
    timeout?: number;
}
export declare const connectToWiFi: ({ ssid, password, isWEP, isHidden, timeout, }: ConnectToWiFiArgs) => Promise<void>;
export declare const disconnectFromWiFi: () => Promise<void>;
export declare const fetchAvailableWifiList: () => Promise<WifiInfo[]>;
export declare const requestLocationPermission: () => Promise<void>;
