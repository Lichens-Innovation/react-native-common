import { PeriodsInMS } from '@lichens-innovation/ts-common';
import axios from 'axios';

import { logRequestEnd, logRequestStart } from '../logger/logger.utils';
import { getAppIdentifier, getDeviceType } from './device.utils';

export const axiosInstance = axios.create({
  timeout: 10 * PeriodsInMS.oneSecond,
  headers: {
    'Content-Type': 'application/json',
    'User-Agent': `native module ${getAppIdentifier()} - ${getDeviceType()}`,
  },
});

axiosInstance.interceptors.request.use(logRequestStart);
axiosInstance.interceptors.response.use(logRequestEnd);

export default axiosInstance;
