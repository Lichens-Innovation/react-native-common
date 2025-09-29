import { Platform } from 'react-native';
import { logger } from '../logger/logger';
export const notImplementedYet = (...args) => {
    logger.debug(`Not implemented yet on "${Platform.OS}" platform`, args);
};
//# sourceMappingURL=platform.utils.js.map