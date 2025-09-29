import * as ImagePicker from 'expo-image-picker';
export declare const toSinglePictureUri: (result: ImagePicker.ImagePickerResult) => string | null;
export declare const requestTakePhotoPermissions: () => Promise<boolean>;
export declare const requestMediaLibPermissions: () => Promise<boolean>;
