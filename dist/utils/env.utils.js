import Constants from 'expo-constants';
import * as Updates from 'expo-updates';
import { logger } from '../logger/logger';
export const isProduction = () => {
    return Updates.channel === 'production';
};
export const isPreview = () => {
    return Updates.channel === 'preview';
};
export const isDevelopment = () => {
    return __DEV__ || !Updates.channel;
};
export const getEnvVarsSource = () => {
    if (Constants.executionEnvironment === 'storeClient') {
        return 'EAS (Production)';
    }
    return 'Local Development';
};
export const validateGetRandomValues = () => {
    if (!(crypto === null || crypto === void 0 ? void 0 : crypto.getRandomValues)) {
        logger.error('[validateGetRandomValues] crypto.getRandomValues is not available as a global environment function');
        return false;
    }
    const typeOfGetRandomValues = typeof crypto.getRandomValues;
    if (typeOfGetRandomValues !== 'function') {
        logger.error(`[validateGetRandomValues] crypto.getRandomValues is not a function: ${typeOfGetRandomValues}`);
        return false;
    }
    logger.debug('[validateGetRandomValues] global crypto getRandomValues is available as a global environment function');
    return true;
};
//# sourceMappingURL=env.utils.js.map