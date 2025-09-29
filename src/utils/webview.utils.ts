import { logger } from '../logger/logger';
import { LoggerMethods } from '../logger/logger.utils';

export const htmlDocumentMessage = (message = {}) => {
  const jsonMessage = JSON.stringify(message ?? {});
  return `
      window.onReactNativeMessage('${jsonMessage}');
      true;
    `;
};

interface LogIncomingHtmlDocMessageArgs {
  type?: LoggerMethods;
  log?: string;
}
export const logIncomingHtmlDocMessage = ({ type = 'log', log = '' }: LogIncomingHtmlDocMessageArgs) => {
  logger[type](`[incoming-html-doc-message] ${log}`);
};
