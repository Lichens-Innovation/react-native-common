import { logger } from '../logger/logger';
export const htmlDocumentMessage = (message = {}) => {
    const jsonMessage = JSON.stringify(message !== null && message !== void 0 ? message : {});
    return `
      window.onReactNativeMessage('${jsonMessage}');
      true;
    `;
};
export const logIncomingHtmlDocMessage = ({ type = 'log', log = '' }) => {
    logger[type](`[incoming-html-doc-message] ${log}`);
};
//# sourceMappingURL=webview.utils.js.map