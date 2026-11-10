import type { CameraView } from 'expo-camera';
import { type RefObject, useEffect, useEffectEvent, useState } from 'react';
import { useTranslation } from 'react-i18next';
import type { Animated } from 'react-native';
import { logger } from '../../../logger/logger';
import type {
  CameraCaptureContext,
  CameraCaptureRefs,
  CameraCaptureState,
  CameraFullModalArgs,
} from './camera-capture.types';
import { selectMedia } from './camera-media-picker';
import { closeCamera } from './camera-session';
import { pressShutter } from './camera-shutter';
import { startRecording } from './camera-video';
import { useCameraCapturePermissions } from './use-camera-capture-permissions';
import { useCameraCaptureState } from './use-camera-capture-state';
import { useCameraSnackbar } from './use-camera-snackbar';
import { useCaptureFlash } from './use-capture-flash';
import { useVolumeShutter } from './use-volume-shutter';

interface UseCameraCaptureArgs extends CameraFullModalArgs {
  allowMultipleSelection: boolean;
}

interface CameraCapture {
  cameraRef: RefObject<CameraView | null>;
  state: CameraCaptureState;
  isAudioGranted: boolean;
  snackbarMessage: string | null;
  snackbarAnim: Animated.Value;
  flashAnim: Animated.Value;
  close: () => void;
  shutter: () => void;
  pickFromLibrary: () => void;
}

const createCaptureRefs = (): CameraCaptureRefs => ({
  camera: { current: null },
  manualStop: { current: false },
  recordWithoutSound: { current: false },
});

const usePendingRecording = (ctx: CameraCaptureContext): void => {
  const { pendingRecording, setPendingRecording } = ctx;
  const startPendingRecording = useEffectEvent(() => {
    startRecording(ctx).catch((error: unknown) => logger.error('[CameraFullModal] recording failed', error));
  });

  /* habit-hooks-disable non-essential-comment
   * Starting is deferred to an effect when the microphone was just granted, so the camera has been
   * unmuted before recordAsync reads it.
   */
  useEffect(() => {
    if (!pendingRecording) return;
    setPendingRecording(false);
    startPendingRecording();
  }, [pendingRecording, setPendingRecording]);
};

export const useCameraCapture = (args: UseCameraCaptureArgs): CameraCapture => {
  const [refs] = useState(createCaptureRefs);
  const { t } = useTranslation();
  const state = useCameraCaptureState();
  const permissions = useCameraCapturePermissions();
  const snackbar = useCameraSnackbar();
  const { flashAnim, triggerCaptureFlash } = useCaptureFlash();
  const ctx: CameraCaptureContext = {
    ...args,
    ...state,
    ...permissions,
    refs,
    t,
    showSnackbar: snackbar.show,
    triggerCaptureFlash,
  };

  usePendingRecording(ctx);
  useVolumeShutter(() => pressShutter(ctx));

  return {
    cameraRef: refs.camera,
    state,
    isAudioGranted: permissions.audioPermission?.granted === true,
    snackbarMessage: snackbar.message,
    snackbarAnim: snackbar.anim,
    flashAnim,
    close: () => closeCamera(ctx),
    shutter: () => pressShutter(ctx),
    pickFromLibrary: () => void selectMedia(ctx),
  };
};
