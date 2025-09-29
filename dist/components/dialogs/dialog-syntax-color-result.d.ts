import { type ComponentProps, type FunctionComponent, type ReactNode } from 'react';
import { Dialog } from 'react-native-paper';
type DialogProps = ComponentProps<typeof Dialog>;
interface DialogSyntaxColorResultProps extends Omit<DialogProps, 'children' | 'visible'> {
    icon?: string;
    title: ReactNode;
    code: string;
    language: string;
    maxCodeLength?: number;
    onClose: () => void;
    isVisible: boolean;
}
export declare const DialogSyntaxColorResult: FunctionComponent<DialogSyntaxColorResultProps>;
export {};
