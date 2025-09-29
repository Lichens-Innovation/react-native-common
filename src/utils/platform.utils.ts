import { Platform } from 'react-native';
import { logger } from '../logger/logger';

export const notImplementedYet = (...args: any[]) => {
  logger.debug(`Not implemented yet on "${Platform.OS}" platform`, args);
};
