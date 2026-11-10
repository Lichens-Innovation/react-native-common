import { logger } from '../../../logger/logger';
import type { CameraCaptureContext } from './camera-capture.types';
import { takePicture } from './camera-picture';
import { takeVideo } from './camera-video';

export const pressShutter = (ctx: CameraCaptureContext): void => {
  const capture = ctx.mode === 'image' ? takePicture : takeVideo;
  capture(ctx).catch((error: unknown) => logger.error('[CameraFullModal] capture failed', error));
};
