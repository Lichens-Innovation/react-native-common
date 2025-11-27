import { addEventListener, NetInfoState, NetInfoSubscription } from '@react-native-community/netinfo';
import { AxiosError, isAxiosError } from 'axios';
import { logger } from '../logger/logger';
import { REGEX_IPV4 } from './regex';
import { isBlank } from './string.utils';

const extractInfoFromNetInfoState = (netInfoState: NetInfoState) => {
  const { isConnected, type } = netInfoState;
  const details = netInfoState.details ?? {};
  const ipAddress = 'ipAddress' in details ? details.ipAddress : '';
  const ipLabel = ipAddress ? `ip: ${ipAddress}` : '';

  return { isConnected, type, ipLabel };
};

export const startNetworkStateLogging = (): NetInfoSubscription => {
  return addEventListener((netInfoState: NetInfoState) => {
    const { isConnected, type, ipLabel } = extractInfoFromNetInfoState(netInfoState);

    if (isConnected) {
      logger.info(`[startNetworkStateLogging] connected: ${type} ${ipLabel}`);
    } else {
      logger.warn(`[startNetworkStateLogging] disconnected`);
    }
  });
};

export const isAxiosNetworkError = (error: unknown): boolean => {
  if (!isAxiosError(error)) {
    return false;
  }

  const code = error.code ?? '';
  if (!code) {
    return false;
  }

  return AxiosError.ERR_NETWORK === code;
};

export const isValidIpAddressV4 = (ip?: string | null): boolean => {
  if (isBlank(ip)) {
    return false;
  }

  return REGEX_IPV4.test(ip);
};
