import type { PermissionResponse } from 'expo-camera';
import { FunctionComponent, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { logger } from '../../../logger/logger';
import {
  type PermissionRequestOutcome,
  requestPermissionOrOpenSettings,
  resolvePermissionRequest,
} from '../../../utils/device/permission.utils';
import { DialogOkCancel } from '../../dialogs/dialog-ok-cancel';

const CLOSING_OUTCOMES: ReadonlyArray<PermissionRequestOutcome> = ['denied', 'settingsOpened'];

interface CameraPermissionDialogProps {
  permission: PermissionResponse;
  requestPermission: () => Promise<PermissionResponse>;
  onClose: () => void;
}

export const CameraPermissionDialog: FunctionComponent<CameraPermissionDialogProps> = ({
  permission,
  requestPermission,
  onClose,
}) => {
  const { t } = useTranslation();
  /** The camera permission was requested since opening: Android's `canAskAgain` can be trusted from then on. habit-hooks-disable non-essential-comment */
  const [cameraAsked, setCameraAsked] = useState(false);
  const options = { askedThisSession: cameraAsked };
  /* habit-hooks-disable non-essential-comment
   * SPOTD-1064: once the OS no longer prompts, asking again silently resolves to denied and left the
   * user stuck on this dialog; the settings are the only way out.
   */
  const mustOpenSettings = resolvePermissionRequest(permission, options) === 'settings';

  const requestCameraAccess = async () => {
    try {
      const outcome = await requestPermissionOrOpenSettings(permission, requestPermission, options);
      setCameraAsked(true);
      // Blocked: stay, the dialog now offers the settings. habit-hooks-disable non-essential-comment
      if (CLOSING_OUTCOMES.includes(outcome)) onClose();
    } catch (error) {
      logger.error('[CameraPermissionDialog] camera permission request failed', error);
    }
  };

  return (
    <DialogOkCancel
      isVisible={true}
      title={t(mustOpenSettings ? 'common:camera.permissionDeniedTitle' : 'common:camera.permissionRequiredTitle')}
      description={t(
        mustOpenSettings ? 'common:camera.permissionDeniedDescription' : 'common:camera.permissionRequiredDescription'
      )}
      okLabel={mustOpenSettings ? t('common:openSettings') : undefined}
      onOk={() => void requestCameraAccess()}
      onCancel={onClose}
    />
  );
};
