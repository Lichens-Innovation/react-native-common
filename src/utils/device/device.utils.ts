import Constants from 'expo-constants';
import * as Device from 'expo-device';
import { Platform } from 'react-native';

export const isRealDevice = (): boolean => {
  return Device.isDevice;
};

export const isEmulator = (): boolean => {
  return !Device.isDevice;
};

export const getDeviceType = (): string => {
  const isReal = isRealDevice();
  return Platform.select({
    ios: isReal ? 'iOS Device' : 'iOS Simulator',
    android: isReal ? 'Android Device' : 'Android Emulator',
    default: isReal ? `${Platform.OS} Real Device` : `${Platform.OS} Emulator`,
  });
};

export const getAppIdentifier = (): string => {
  const bundleId = Platform.select({
    ios: Constants.expoConfig?.ios?.bundleIdentifier,
    android: Constants.expoConfig?.android?.package,
    default: 'Unknown',
  });

  const id = bundleId?.split('.').pop();
  return id ?? '';
};
