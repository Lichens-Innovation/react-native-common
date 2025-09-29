import { JSX, PropsWithChildren } from 'react';
export declare const SnackbarContext: import("react").Context<{
    showSnackbarMessage: (_msg: string, _duration?: number) => void;
}>;
export declare const useSnackbar: () => {
    showSnackbarMessage: (_msg: string, _duration?: number) => void;
};
export declare const SnackbarProvider: ({ children }: PropsWithChildren) => JSX.Element;
