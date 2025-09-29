import { logger } from '../logger/logger';
export const getErrorMessage = (error) => {
    if (!error) {
        return '';
    }
    if (typeof error === 'string') {
        return error;
    }
    if (typeof error === 'object' && 'message' in error) {
        return error.message;
    }
    return JSON.stringify(error);
};
export const loggedError = ({ context, e }) => {
    const errorMessage = getErrorMessage(e);
    const errorMessageDetails = `${context}: ${errorMessage}`;
    logger.error(errorMessageDetails, e);
    return new Error(errorMessageDetails);
};
//# sourceMappingURL=errors.utils.js.map