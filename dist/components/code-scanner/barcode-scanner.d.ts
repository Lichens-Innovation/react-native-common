import { BarcodeScanningResult } from 'expo-camera';
import { FunctionComponent } from 'react';
interface BarcodeScannerProps {
    onBarcodeScanned: (result: BarcodeScanningResult) => void;
}
export declare const BarcodeScanner: FunctionComponent<BarcodeScannerProps>;
export {};
