import { type ComponentProps, type FunctionComponent, type ReactNode } from 'react';
import { Dialog } from 'react-native-paper';
type DialogProps = ComponentProps<typeof Dialog>;
export interface DialogCloseOnlyProps extends Omit<DialogProps, 'children' | 'visible'> {
    icon?: string;
    title?: ReactNode;
    content?: ReactNode;
    onClose: () => void;
    isVisible: boolean;
}
export declare const DialogCloseOnly: FunctionComponent<DialogCloseOnlyProps>;
export {};
