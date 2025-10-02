import axios from 'axios';
import { logRequestEnd, logRequestStart } from '../logger/logger.utils';
import { getAppIdentifier, getDeviceType } from './device.utils';
import { PeriodsInMilliseconds } from './time.utils';

export const axiosInstance = axios.create({
  timeout: 10 * PeriodsInMilliseconds.oneSecond,
  headers: {
    'Content-Type': 'application/json',
    'User-Agent': `native module ${getAppIdentifier()} - ${getDeviceType()}`,
  },
});

axiosInstance.interceptors.request.use(logRequestStart);
axiosInstance.interceptors.response.use(logRequestEnd);

export default axiosInstance;
