import { Platform } from 'react-native';
export const isRealDevice = () => {
    return true;
};
export const isEmulator = () => {
    return !isRealDevice();
};
export const getDeviceType = () => {
    return `${Platform.OS} Real Device`;
};
//# sourceMappingURL=device.utils.windows.js.map