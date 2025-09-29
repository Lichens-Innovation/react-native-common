import { useState } from 'react';
import { logger } from '../logger/logger';
import { logIncomingHtmlDocMessage } from '../utils/webview.utils';
export const useOnHtmlDocMessage = () => {
    const [isDocumentReady, setIsDocumentReady] = useState(false);
    const onMessage = (payload) => {
        var _a, _b;
        const payloadData = (_b = (_a = payload === null || payload === void 0 ? void 0 : payload.nativeEvent) === null || _a === void 0 ? void 0 : _a.data) !== null && _b !== void 0 ? _b : '';
        try {
            const { type, data } = JSON.parse(payloadData);
            if (type === 'documentReady') {
                setIsDocumentReady(true);
            }
            else if (type === 'console') {
                logIncomingHtmlDocMessage(data);
            }
            else {
                logger.warn(`useWebviewDocument onMessage: <${type}> not handled`);
            }
        }
        catch (e) {
            logger.error('Error in useWebviewDocument onMessage', e, payloadData);
        }
    };
    return {
        isDocumentReady,
        onMessage,
    };
};
//# sourceMappingURL=use-on-html-message.js.map