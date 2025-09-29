import { LoggerMethods } from '../logger/logger.utils';
export declare const htmlDocumentMessage: (message?: {}) => string;
interface LogIncomingHtmlDocMessageArgs {
    type?: LoggerMethods;
    log?: string;
}
export declare const logIncomingHtmlDocMessage: ({ type, log }: LogIncomingHtmlDocMessageArgs) => void;
export {};
