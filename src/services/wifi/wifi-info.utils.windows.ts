import { notImplementedYet } from '../../utils/platform.utils';
import { WifiInfo } from './wifi-info.types';

export const fetchWifiInfo = async (): Promise<WifiInfo> => {
  notImplementedYet('fetchWifiInfo');
  throw new Error('fetchWifiInfo is not implemented for Windows');
};
