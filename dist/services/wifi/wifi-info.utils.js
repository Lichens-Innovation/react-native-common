import * as Location from 'expo-location';
import WifiManager from 'react-native-wifi-reborn';
import { logger } from '../../logger/logger';
import { isRealDevice } from '../../utils/device.utils';
import { DEFAULT_CONNECT_WIFI_TIMEOUT, toWifiInfoArray } from './wifi-info.types';
import { fetchAvailableWifiListSimulator, fetchWifiInfosSimulator } from './wifi-info.utils.simulator';
export const fetchWifiInfo = async () => {
    var _a, _b;
    if (!isRealDevice()) {
        return fetchWifiInfosSimulator();
    }
    try {
        await requestLocationPermission();
        const [ssid, signalStrength, ip] = await Promise.all([
            WifiManager.getCurrentWifiSSID(),
            // the following methods are not implemented on all platforms:
            (_a = WifiManager.getCurrentSignalStrength) === null || _a === void 0 ? void 0 : _a.call(WifiManager),
            (_b = WifiManager.getIP) === null || _b === void 0 ? void 0 : _b.call(WifiManager),
        ]);
        return {
            ssid,
            signalStrength: Math.abs(signalStrength !== null && signalStrength !== void 0 ? signalStrength : 0),
            ip: ip !== null && ip !== void 0 ? ip : '',
        };
    }
    catch (e) {
        if (isDisconnectedOrConnecting(e)) {
            logger.info('[fetchWifiInfo] Cannot fetch WiFi info since state is either disconnected or connecting');
        }
        else {
            logger.error('[fetchWifiInfo] Error fetching WiFi info', e);
        }
        throw e;
    }
};
export const isDisconnectedOrConnecting = (e) => {
    return e instanceof Error && e.message.toLowerCase().includes('not connected or connecting');
};
export const isUnexpectedWifiConnectionError = (e) => {
    return !!e && !isDisconnectedOrConnecting(e);
};
export const connectToWiFi = async ({ ssid, password, isWEP = false, isHidden = false, timeout = DEFAULT_CONNECT_WIFI_TIMEOUT, }) => {
    try {
        logger.info(`[connectToWiFi] attempting to connect to WiFi ${ssid}`);
        await WifiManager.connectToProtectedWifiSSID({ ssid, password, isWEP, isHidden, timeout });
        logger.info(`[connectToWiFi] Connected to WiFi ${ssid}`);
    }
    catch (e) {
        logger.info(`[connectToWiFi] Unable to connect to WiFi ${ssid}`, e); // perhaps bad password
        throw e;
    }
};
export const disconnectFromWiFi = async () => {
    try {
        logger.info('[disconnectFromWiFi]: disconnecting from WiFi');
        await WifiManager.disconnect();
        logger.info('[disconnectFromWiFi]: Disconnected from WiFi');
    }
    catch (e) {
        logger.error('[disconnectFromWiFi]: Error disconnecting from WiFi', e);
        throw e;
    }
};
export const fetchAvailableWifiList = async () => {
    if (!isRealDevice()) {
        return fetchAvailableWifiListSimulator();
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
    }
    catch (e) {
        logger.error('[fetchAvailableWifiList] Error fetching available WiFi list', e);
        throw e;
    }
};
export const requestLocationPermission = async () => {
    const { status } = await Location.requestForegroundPermissionsAsync();
    if (status !== 'granted') {
        throw new Error(`Location permission not granted: ${status}`);
    }
};
//# sourceMappingURL=wifi-info.utils.js.map