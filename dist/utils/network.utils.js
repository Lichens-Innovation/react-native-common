import { addEventListener } from '@react-native-community/netinfo';
import { AxiosError, isAxiosError } from 'axios';
import { logger } from '../logger/logger';
const extractInfoFromNetInfoState = (netInfoState) => {
    var _a;
    const { isConnected, type } = netInfoState;
    const details = (_a = netInfoState.details) !== null && _a !== void 0 ? _a : {};
    const ipAddress = 'ipAddress' in details ? details.ipAddress : '';
    const ipLabel = ipAddress ? `ip: ${ipAddress}` : '';
    return { isConnected, type, ipLabel };
};
export const startNetworkStateLogging = () => {
    return addEventListener((netInfoState) => {
        const { isConnected, type, ipLabel } = extractInfoFromNetInfoState(netInfoState);
        if (isConnected) {
            logger.info(`[startNetworkStateLogging] connected: ${type} ${ipLabel}`);
        }
        else {
            logger.warn(`[startNetworkStateLogging] disconnected`);
        }
    });
};
export const isAxiosNetworkError = (error) => {
    var _a;
    if (!isAxiosError(error)) {
        return false;
    }
    const code = (_a = error.code) !== null && _a !== void 0 ? _a : '';
    if (!code) {
        return false;
    }
    return AxiosError.ERR_NETWORK === code;
};
//# sourceMappingURL=network.utils.js.map