import { useMicrophonePermissions } from 'expo-camera';
import * as MediaLibrary from 'expo-media-library';
import type { CameraCapturePermissions } from './camera-capture.types';

export const useCameraCapturePermissions = (): CameraCapturePermissions => {
  const [audioPermission, requestAudioPermission] = useMicrophonePermissions();
  const [mediaPermission, requestMediaPermission] = MediaLibrary.usePermissions({ writeOnly: true });

  return { audioPermission, requestAudioPermission, mediaPermission, requestMediaPermission };
};
