import { Platform } from 'react-native';

export const isRealDevice = (): boolean => {
  return true;
};

export const isEmulator = (): boolean => {
  return !isRealDevice();
};

export const getDeviceType = (): string => {
  return `${Platform.OS} Real Device`;
};
