import * as ImagePicker from 'expo-image-picker';
import { useTranslation } from 'react-i18next';
import { useSnackbar } from '../../components/snack-bar/snackbar-provider';
import { logger } from '../../logger/logger';
import { requestTakePhotoPermissions, toSinglePictureUri } from './camera-image-picker.utils';

const DEFAULT_OPTIONS: ImagePicker.ImagePickerOptions = {
  allowsEditing: true,
  aspect: [4, 3],
  quality: 0.7,
};

const launchForSinglePictureUri = async (
  launchPicker: () => Promise<ImagePicker.ImagePickerResult>,
  onError: (e: unknown) => void
): Promise<string | null> => {
  try {
    const result = await launchPicker();
    return toSinglePictureUri(result);
  } catch (e: unknown) {
    onError(e);
    return null;
  }
};

export const useCameraImagePicker = (options = DEFAULT_OPTIONS) => {
  const { t } = useTranslation();
  const { showSnackbarMessage } = useSnackbar();

  const handleError = (e: unknown) => {
    logger.error('[useCameraImagePicker] Error picking image', e);
    showSnackbarMessage(t('common:imagePicker.error'));
  };

  /* habit-hooks-disable non-essential-comment
   * No media-library permission requested: launchImageLibraryAsync uses the Android Photo Picker
   * (and iOS limited picker), which need no READ permission. */
  const pickImage = () => launchForSinglePictureUri(() => ImagePicker.launchImageLibraryAsync(options), handleError);

  const takePhoto = async () => {
    const hasPermission = await requestTakePhotoPermissions();
    if (!hasPermission) {
      showSnackbarMessage(t('common:imagePicker.permissionDenied'));
      return null;
    }

    return launchForSinglePictureUri(() => ImagePicker.launchCameraAsync(options), handleError);
  };

  return {
    pickImage,
    takePhoto,
  };
};
