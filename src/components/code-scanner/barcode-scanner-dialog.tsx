import { BarcodeScanningResult } from 'expo-camera';
import React, { FunctionComponent, useEffect, useState } from 'react';
import { DialogCloseOnly, DialogCloseOnlyProps } from '../dialogs/dialog-close-only';
import { BarcodeScanner } from './barcode-scanner';
import { getPermissionMessage, requestCameraPermissions } from './barcode-scanner.utils';

interface BarcodeScannerDialogProps extends DialogCloseOnlyProps {
  isVisible: boolean;
  title: string;
  onClose: () => void;
  onBarcodeScanned: (result: BarcodeScanningResult) => void;
}

export const BarcodeScannerDialog: FunctionComponent<BarcodeScannerDialogProps> = ({
  isVisible,
  title,
  onClose,
  onBarcodeScanned,
  ...rest
}) => {
  const [hasPermission, setHasPermission] = useState<boolean>();

  useEffect(() => {
    requestCameraPermissions().then(setHasPermission);
  }, []);

  if (!isVisible) {
    return null;
  }

  if (!hasPermission) {
    const message = getPermissionMessage(hasPermission);
    return <DialogCloseOnly isVisible={true} title={title} onClose={onClose} content={message} {...rest} />;
  }

  return (
    <DialogCloseOnly
      isVisible={true}
      title={title}
      onClose={onClose}
      content={<BarcodeScanner onBarcodeScanned={onBarcodeScanned} />}
      {...rest}
    />
  );
};
