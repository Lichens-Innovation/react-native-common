import { Platform } from 'react-native';

export const getMonospaceFontName = (): string => {
  return Platform.select({
    ios: 'Menlo',
    default: 'monospace',
  });
};
