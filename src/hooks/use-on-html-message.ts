import { useState } from 'react';
import { WebViewMessageEvent } from 'react-native-webview';
import { logger } from '../logger/logger';
import { logIncomingHtmlDocMessage } from '../utils/webview.utils';

export const useOnHtmlDocMessage = () => {
  const [isDocumentReady, setIsDocumentReady] = useState<boolean>(false);

  const onMessage = (payload: WebViewMessageEvent) => {
    const payloadData = payload?.nativeEvent?.data ?? '';

    try {
      const { type, data } = JSON.parse(payloadData);

      if (type === 'documentReady') {
        setIsDocumentReady(true);
      } else if (type === 'console') {
        logIncomingHtmlDocMessage(data);
      } else {
        logger.warn(`useWebviewDocument onMessage: <${type}> not handled`);
      }
    } catch (e) {
      logger.error('Error in useWebviewDocument onMessage', e, payloadData);
    }
  };

  return {
    isDocumentReady,
    onMessage,
  };
};
