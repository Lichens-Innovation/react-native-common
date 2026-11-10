import * as ExpoCamera from 'expo-camera';
import { Alert } from 'react-native';
import { logger } from '../../../logger/logger';
import { openAppSettings, resolvePermissionRequest } from '../../../utils/device/permission.utils';
import type { CameraCaptureContext } from './camera-capture.types';
import { backupToGallery } from './camera-gallery';
import { closeCamera, registerCaptures, stopVideoRecording } from './camera-session';

const VIDEO_MAX_DURATION_S = 180;
const VIDEO_PARAMS = {
  maxDuration: VIDEO_MAX_DURATION_S,
  codec: 'avc1' as ExpoCamera.VideoCodec,
};

/** habit-hooks-disable non-essential-comment
 * - `ready`: record now, with sound or muted as the user accepted.
 * - `justGranted`: the OS prompt was just accepted, but the camera is still muted until the next render.
 * - `cancelled`: the user went to the settings instead.
 */
type MicrophoneReadiness = 'ready' | 'justGranted' | 'cancelled';

const confirmRecordWithoutSound = (ctx: CameraCaptureContext): Promise<boolean> =>
  new Promise<boolean>((resolve) => {
    const openSettings = () => {
      resolve(false);
      closeCamera(ctx);
      void openAppSettings();
    };
    const recordMuted = () => {
      ctx.refs.recordWithoutSound.current = true;
      resolve(true);
    };
    const { t } = ctx;
    Alert.alert(
      t('common:camera.microphoneDeniedTitle'),
      t('common:camera.microphoneDeniedDescription'),
      [
        { text: t('common:openSettings'), onPress: openSettings },
        { text: t('common:camera.recordWithoutSound'), onPress: recordMuted },
      ],
      { cancelable: false }
    );
  });

const ensureMicrophone = async (ctx: CameraCaptureContext): Promise<MicrophoneReadiness> => {
  if (ctx.refs.recordWithoutSound.current) return 'ready';

  const action = resolvePermissionRequest(ctx.audioPermission);
  if (action === 'granted') return 'ready';
  if (action === 'prompt') {
    const response = await ctx.requestAudioPermission();
    if (response.granted) return 'justGranted';
  }

  const recordsMuted = await confirmRecordWithoutSound(ctx);
  return recordsMuted ? 'ready' : 'cancelled';
};

const notifyAutoStopped = (ctx: CameraCaptureContext): void => {
  logger.info('Video recording stopped automatically after reaching time limit');
  ctx.showSnackbar(ctx.t('common:camera.videoLengthLimitReached', { seconds: VIDEO_MAX_DURATION_S }));
  ctx.setIsRecording(false);
  ctx.triggerCaptureFlash();
};

export const startRecording = async (ctx: CameraCaptureContext): Promise<void> => {
  const camera = ctx.refs.camera.current;
  if (!camera) return;
  ctx.refs.manualStop.current = false;
  ctx.setIsRecording(true);
  const video = await camera.recordAsync(VIDEO_PARAMS);
  const wasAutoStopped = !ctx.refs.manualStop.current;
  ctx.refs.manualStop.current = false;
  if (!video) {
    Alert.alert('Error', 'Failed to record video.');
    ctx.setIsRecording(false);
    return;
  }
  if (wasAutoStopped) notifyAutoStopped(ctx);

  await backupToGallery(ctx, video.uri);
  ctx.setIsRecording(false);
  registerCaptures(ctx, [video.uri]);
};

export const takeVideo = async (ctx: CameraCaptureContext): Promise<void> => {
  if (!ctx.refs.camera.current) return;
  if (ctx.isRecording) {
    stopVideoRecording(ctx);
    return;
  }

  const microphone = await ensureMicrophone(ctx);
  if (microphone === 'cancelled') return;
  if (microphone === 'justGranted') {
    ctx.setPendingRecording(true);
    return;
  }

  await startRecording(ctx);
};
