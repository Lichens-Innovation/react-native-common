import { type ComponentProps, type FunctionComponent, type ReactNode } from 'react';
import { Dialog } from 'react-native-paper';
type DialogProps = ComponentProps<typeof Dialog>;
interface DialogOkCancelProps extends Omit<DialogProps, 'children' | 'visible'> {
    icon?: string;
    title?: ReactNode;
    description?: ReactNode;
    onOk: () => void;
    onCancel: () => void;
    isVisible: boolean;
}
export declare const DialogOkCancel: FunctionComponent<DialogOkCancelProps>;
export {};
