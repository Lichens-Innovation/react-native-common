import { isNullish } from '../../utils/types.utils';
export const MIN_WIFI_PASSWORD_LENGTH = 8;
export const RV_CAM_NETWORK_SSID_REGEX = /^RVMAX[_-][a-zA-Z0-9]+$/i;
export const RINNO_CAM_NETWORK_SSID_REGEX = /^RVMAX\-[0-9]+$/;
export const DEFAULT_CONNECT_WIFI_TIMEOUT = 10 * 1000;
export const isRinnoNormalizedSSID = (ssid) => {
    if (!ssid) {
        return false;
    }
    return RINNO_CAM_NETWORK_SSID_REGEX.test(ssid);
};
export const getRVMaxWiFiDefaultPassword = (ssid) => {
    if (isNullish(ssid) || isRinnoNormalizedSSID(ssid)) {
        return 'RinnoVision';
    }
    return 'Rinnovision'; // legacy default password
};
export const toWifiInfoArray = (networks) => {
    if (!Array.isArray(networks)) {
        return [];
    }
    return [...networks].map(toWifiInfo).sort(wifiNetworkComparator);
};
const toWifiInfo = (network) => {
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
export const isRvCamNetwork = (ssid) => {
    return RV_CAM_NETWORK_SSID_REGEX.test(ssid);
};
export const wifiNetworkComparator = (a, b) => {
    if (isRvCamNetwork(a.ssid) && !isRvCamNetwork(b.ssid)) {
        return -1;
    }
    if (!isRvCamNetwork(a.ssid) && isRvCamNetwork(b.ssid)) {
        return 1;
    }
    return b.signalStrength - a.signalStrength;
};
//# sourceMappingURL=wifi-info.types.js.map