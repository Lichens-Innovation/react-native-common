import * as MediaLibrary from 'expo-media-library';
import { logger } from '../../../logger/logger';
import type { CameraCaptureContext } from './camera-capture.types';

const ensureGalleryPermission = async (ctx: CameraCaptureContext): Promise<boolean> => {
  if (ctx.mediaPermission?.granted) return true;
  const response = await ctx.requestMediaPermission();
  return response?.granted === true;
};

export const backupToGallery = async (ctx: CameraCaptureContext, uri: string): Promise<void> => {
  const isGranted = await ensureGalleryPermission(ctx);
  if (!isGranted) return;

  try {
    await MediaLibrary.saveToLibraryAsync(uri);
  } catch (e) {
    logger.warn('Gallery backup failed:', e);
  }
};
