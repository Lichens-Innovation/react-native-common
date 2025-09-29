import { BarcodeScanningResult, CameraView } from 'expo-camera';
import React, { FunctionComponent } from 'react';
import { useTranslation } from 'react-i18next';
import { StyleSheet, useWindowDimensions, View } from 'react-native';
import { Text } from 'react-native-paper';
import { useAppTheme } from '../../theme/theme';
import { BARCODE_TYPES } from './barcode-scanner.utils';

interface BarcodeScannerProps {
  onBarcodeScanned: (result: BarcodeScanningResult) => void;
}

export const BarcodeScanner: FunctionComponent<BarcodeScannerProps> = ({ onBarcodeScanned }) => {
  const styles = useStyles();
  const { t } = useTranslation();

  return (
    <>
      <View style={styles.cameraContainer}>
        <CameraView
          style={[StyleSheet.absoluteFillObject, styles.camera]}
          onBarcodeScanned={onBarcodeScanned}
          barcodeScannerSettings={{ barcodeTypes: BARCODE_TYPES }}
          facing="back"
        />
      </View>

      <Text variant="bodySmall" style={styles.instruction}>
        {t('common:barcodeScanner.scanBarcodeInstruction')}
      </Text>
    </>
  );
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
