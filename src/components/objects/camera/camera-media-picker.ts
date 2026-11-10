import * as ImagePicker from 'expo-image-picker';
import { Alert } from 'react-native';
import { logger } from '../../../logger/logger';
import { normalizeImagesToJpeg } from '../../../utils/images/image-convert.utils';
import type { CameraCaptureContext } from './camera-capture.types';
import { closeCamera } from './camera-session';

export const selectMedia = async (ctx: CameraCaptureContext): Promise<void> => {
  try {
    /* habit-hooks-disable non-essential-comment
     * No media-library permission requested: launchImageLibraryAsync uses the
     * Android Photo Picker (and iOS limited picker), which need no READ permission.
     */
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ctx.mode === 'video' ? ['videos'] : ['images'],
      allowsEditing: false,
      quality: 1,
      allowsMultipleSelection: ctx.allowMultipleSelection,
    });
    if (result.canceled || result.assets.length === 0) return;

    const uris = result.assets.map((asset) => asset.uri);
    const finalUris = ctx.mode === 'video' ? uris : await normalizeImagesToJpeg(uris);
    ctx.handleObjectsTaken(finalUris);
    closeCamera(ctx);
  } catch (e) {
    logger.warn('Media selection failed:', e);
    Alert.alert('Error', 'Failed to select media. Please try again.');
    ctx.setIsRecording(false);
  }
};
