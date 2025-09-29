import * as Device from 'expo-device';
import { Platform } from 'react-native';
export const isRealDevice = () => {
    return Device.isDevice;
};
export const isEmulator = () => {
    return !Device.isDevice;
};
export const getDeviceType = () => {
    const isReal = isRealDevice();
    return Platform.select({
        ios: isReal ? 'iOS Device' : 'iOS Simulator',
        android: isReal ? 'Android Device' : 'Android Emulator',
        default: isReal ? `${Platform.OS} Real Device` : `${Platform.OS} Emulator`,
    });
};
//# sourceMappingURL=device.utils.js.map