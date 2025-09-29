import { jsx as _jsx, Fragment as _Fragment, jsxs as _jsxs } from "react/jsx-runtime";
import { CameraView } from 'expo-camera';
import { useTranslation } from 'react-i18next';
import { StyleSheet, useWindowDimensions, View } from 'react-native';
import { Text } from 'react-native-paper';
import { useAppTheme } from '../../theme/theme';
import { BARCODE_TYPES } from './barcode-scanner.utils';
export const BarcodeScanner = ({ onBarcodeScanned }) => {
    const styles = useStyles();
    const { t } = useTranslation();
    return (_jsxs(_Fragment, { children: [_jsx(View, { style: styles.cameraContainer, children: _jsx(CameraView, { style: [StyleSheet.absoluteFillObject, styles.camera], onBarcodeScanned: onBarcodeScanned, barcodeScannerSettings: { barcodeTypes: BARCODE_TYPES }, facing: "back" }) }), _jsx(Text, { variant: "bodySmall", style: styles.instruction, children: t('common:barcodeScanner.scanBarcodeInstruction') })] }));
};
const DIALOG_HEADER_AND_FOOTER_HEIGHT = 200;
const MAX_CAMERA_HEIGHT = 560;
const useStyles = () => {
    const theme = useAppTheme();
    const { height } = useWindowDimensions();
    return StyleSheet.create({
        cameraContainer: {
            alignSelf: 'center',
            width: '100%',
            height: Math.min(height - DIALOG_HEADER_AND_FOOTER_HEIGHT, MAX_CAMERA_HEIGHT),
        },
        camera: {
            borderWidth: 2,
            borderColor: theme.colors.primary,
            borderStyle: 'dashed',
        },
        instruction: {
            textAlign: 'center',
        },
    });
};
//# sourceMappingURL=barcode-scanner.js.map