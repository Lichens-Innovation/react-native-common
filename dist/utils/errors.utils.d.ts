export declare const getErrorMessage: (error: unknown) => string;
interface ErrorLogHandlerArgs {
    context: string;
    e: unknown;
}
export declare const loggedError: ({ context, e }: ErrorLogHandlerArgs) => Error;
export {};
