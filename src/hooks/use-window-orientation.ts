import { useWindowDimensions } from 'react-native';

export type WindowOrientation = 'portrait' | 'landscape';

export const useWindowOrientation = (): WindowOrientation => {
  const { width, height } = useWindowDimensions();
  return width > height ? 'landscape' : 'portrait';
};

export const useIsLandscape = (): boolean => {
  const orientation = useWindowOrientation();
  return orientation === 'landscape';
};
