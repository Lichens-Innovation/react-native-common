import { WebViewMessageEvent } from 'react-native-webview';
export declare const useOnHtmlDocMessage: () => {
    isDocumentReady: boolean;
    onMessage: (payload: WebViewMessageEvent) => void;
};
