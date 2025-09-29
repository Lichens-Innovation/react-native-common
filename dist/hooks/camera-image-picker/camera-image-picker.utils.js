import * as ImagePicker from 'expo-image-picker';
export const toSinglePictureUri = (result) => {
    if (!result.canceled && result.assets.length > 0) {
        return result.assets[0].uri;
    }
    return null;
};
export const requestTakePhotoPermissions = async () => {
    const { status } = await ImagePicker.requestCameraPermissionsAsync();
    return status === 'granted';
};
export const requestMediaLibPermissions = async () => {
    const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
    return status === 'granted';
};
//# sourceMappingURL=camera-image-picker.utils.js.map