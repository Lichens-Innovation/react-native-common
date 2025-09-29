import { logger } from '../logger/logger';

export const getErrorMessage = (error: unknown): string => {
  if (!error) {
    return '';
  }

  if (typeof error === 'string') {
    return error;
  }

  if (typeof error === 'object' && 'message' in error) {
    return (error as any).message;
  }

  return JSON.stringify(error);
};

interface ErrorLogHandlerArgs {
  context: string;
  e: unknown;
}

export const loggedError = ({ context, e }: ErrorLogHandlerArgs) => {
  const errorMessage = getErrorMessage(e);
  const errorMessageDetails = `${context}: ${errorMessage}`;
  logger.error(errorMessageDetails, e);

  return new Error(errorMessageDetails);
};
