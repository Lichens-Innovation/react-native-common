import { isNullish } from '@lichens-innovation/ts-common';
import { BarcodeType, Camera } from 'expo-camera';
import i18next from 'i18next';

import { logger } from '../../logger/logger';

export const BARCODE_TYPES: BarcodeType[] = [
  'aztec',
  'ean13',
  'ean8',
  'qr',
  'pdf417',
  'upc_e',
  'datamatrix',
  'code39',
  'code93',
  'itf14',
  'codabar',
  'code128',
  'upc_a',
];

export const getPermissionMessage = (hasPermission?: boolean | null): string => {
  if (isNullish(hasPermission)) {
    return i18next.t('common:barcodeScanner.requestingCameraPermission');
  }

  return hasPermission
    ? i18next.t('common:barcodeScanner.cameraAccessGranted')
    : i18next.t('common:barcodeScanner.noCameraAccess');
};

export const requestCameraPermissions = async (): Promise<boolean> => {
  try {
    const { status } = await Camera.requestCameraPermissionsAsync();
    return status === 'granted';
  } catch (e: unknown) {
    logger.error('[BarcodeScanner] Failed to request camera permissions', e);
    return false;
  }
};
