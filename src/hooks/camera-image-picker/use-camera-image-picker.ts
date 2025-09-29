import * as ImagePicker from 'expo-image-picker';
import { useTranslation } from 'react-i18next';
import { useSnackbar } from '../../components/snack-bar/snackbar-provider';
import { logger } from '../../logger/logger';
import {
  requestMediaLibPermissions,
  requestTakePhotoPermissions,
  toSinglePictureUri,
} from './camera-image-picker.utils';

const DEFAULT_OPTIONS: ImagePicker.ImagePickerOptions = {
  allowsEditing: true,
  aspect: [4, 3],
  quality: 0.7,
};

export const useCameraImagePicker = (options = DEFAULT_OPTIONS) => {
  const { t } = useTranslation();
  const { showSnackbarMessage } = useSnackbar();

  const handlePermissionDenied = () => {
    showSnackbarMessage(t('common:imagePicker.permissionDenied'));
    return null;
  };

  const handleError = (e: unknown) => {
    logger.error('[useCameraImagePicker] Error picking image', e);
    showSnackbarMessage(t('common:imagePicker.error'));
  };

  const pickImage = async () => {
    const hasPermission = await requestMediaLibPermissions();
    if (!hasPermission) return handlePermissionDenied();

    try {
      const result = await ImagePicker.launchImageLibraryAsync(options);
      return toSinglePictureUri(result);
    } catch (e: unknown) {
      handleError(e);
    }

    return null;
  };

  const takePhoto = async () => {
    const hasPermission = await requestTakePhotoPermissions();
    if (!hasPermission) return handlePermissionDenied();

    try {
      const result = await ImagePicker.launchCameraAsync(options);
      return toSinglePictureUri(result);
    } catch (e: unknown) {
      handleError(e);
    }

    return null;
  };

  return {
    pickImage,
    takePhoto,
  };
};
