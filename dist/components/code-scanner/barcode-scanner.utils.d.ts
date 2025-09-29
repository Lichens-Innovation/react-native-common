import { BarcodeType } from 'expo-camera';
export declare const BARCODE_TYPES: BarcodeType[];
export declare const getPermissionMessage: (hasPermission?: boolean | null) => string;
export declare const requestCameraPermissions: () => Promise<boolean>;
