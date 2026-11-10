import { getErrorMessage } from '@lichens-innovation/ts-common';
import { Alert, Platform } from 'react-native';
import { normalizeImageToJpeg } from '../../../utils/images/image-convert.utils';
import type { CameraCaptureContext } from './camera-capture.types';
import { backupToGallery } from './camera-gallery';
import { registerCaptures } from './camera-session';

const PICTURE_PARAMS = { base64: false, quality: 0.8 };

export const takePicture = async (ctx: CameraCaptureContext): Promise<void> => {
  const camera = ctx.refs.camera.current;
  if (!camera) return;

  try {
    const picture = await camera.takePictureAsync(PICTURE_PARAMS);
    if (!picture) {
      Alert.alert('Error', 'Failed to take picture.');
      return;
    }
    if (Platform.OS === 'ios') ctx.triggerCaptureFlash();

    await backupToGallery(ctx, picture.uri);
    const jpegUri = await normalizeImageToJpeg(picture.uri);
    registerCaptures(ctx, [jpegUri]);
  } catch (error) {
    Alert.alert('Error', 'Failed to save picture: ' + getErrorMessage(error));
  }
};
