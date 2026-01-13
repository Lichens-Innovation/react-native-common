import { getErrorMessage } from '@lichens-innovation/ts-common';

import { logger } from '../logger/logger';

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
