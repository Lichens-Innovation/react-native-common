import * as ImagePicker from 'expo-image-picker';
export declare const useCameraImagePicker: (options?: ImagePicker.ImagePickerOptions) => {
    pickImage: () => Promise<string | null>;
    takePhoto: () => Promise<string | null>;
};
