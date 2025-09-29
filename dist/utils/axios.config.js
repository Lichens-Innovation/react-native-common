import axios from 'axios';
import { logRequestEnd, logRequestStart } from '../logger/logger.utils';
import { getDeviceType } from './device.utils';
export const axiosInstance = axios.create({
    timeout: 2000,
    headers: {
        'Content-Type': 'application/json',
        'User-Agent': `Rinno native module - ${getDeviceType()}`,
    },
});
axiosInstance.interceptors.request.use(logRequestStart);
axiosInstance.interceptors.response.use(logRequestEnd);
export default axiosInstance;
//# sourceMappingURL=axios.config.js.map