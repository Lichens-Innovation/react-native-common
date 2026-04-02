import Constants from 'expo-constants';
import { Platform } from 'react-native';

export const isRealDevice = (): boolean => {
  return true;
};

export const isEmulator = (): boolean => {
  return !isRealDevice();
};

export const getDeviceType = (): string => {
  return `${Platform.OS} (web profile)`;
};

export const getAppIdentifier = (): string => {
  const bundleId = Platform.select({
    ios: Constants.expoConfig?.ios?.bundleIdentifier,
    android: Constants.expoConfig?.android?.package,
    default: Constants.expoConfig?.slug ?? 'unknown',
  });

  const id = bundleId?.split('.').pop();
  return id ?? '';
};
