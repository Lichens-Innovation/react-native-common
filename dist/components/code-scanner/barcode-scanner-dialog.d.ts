import { BarcodeScanningResult } from 'expo-camera';
import { FunctionComponent } from 'react';
import { DialogCloseOnlyProps } from '../dialogs/dialog-close-only';
interface BarcodeScannerDialogProps extends DialogCloseOnlyProps {
    isVisible: boolean;
    title: string;
    onClose: () => void;
    onBarcodeScanned: (result: BarcodeScanningResult) => void;
}
export declare const BarcodeScannerDialog: FunctionComponent<BarcodeScannerDialogProps>;
export {};
