import { logger } from '../../../logger/logger';
import type { CameraCaptureContext } from './camera-capture.types';

export const stopVideoRecording = (ctx: CameraCaptureContext): void => {
  ctx.refs.manualStop.current = true;
  ctx.refs.camera.current?.stopRecording();
  ctx.setIsRecording(false);
  ctx.triggerCaptureFlash();
};

export const closeCamera = (ctx: CameraCaptureContext): void => {
  try {
    if (ctx.isRecording && ctx.refs.camera.current) stopVideoRecording(ctx);
  } catch (e) {
    logger.warn('Failed to stop the recording while closing the camera', e);
  }
  ctx.setTorchEnabled(false);
  setTimeout(() => ctx.onClose(), 0);
};

export const registerCaptures = (ctx: CameraCaptureContext, uris: string[]): void => {
  ctx.handleObjectsTaken(uris);
  ctx.setCaptureCount((count) => count + 1);
  if (!ctx.allowMultipleSelection) closeCamera(ctx);
};
