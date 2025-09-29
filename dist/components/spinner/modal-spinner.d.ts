import { FunctionComponent, ReactNode } from 'react';
export interface ModalSpinnerProps {
    isVisible: boolean;
    title?: ReactNode;
    description?: ReactNode;
    modelLoadingLogs: string[];
    onDismiss: () => void;
}
export declare const ModalSpinner: FunctionComponent<ModalSpinnerProps>;
