import * as ImagePicker from 'expo-image-picker';
import { useState } from 'react';
import { Image } from 'react-native';
import { logger } from '../logger/logger';
const options = {
    mediaTypes: ['images', 'livePhotos'],
    allowsEditing: true,
    quality: 1,
};
const DEFAULT_DIMENSIONS = {
    width: 0,
    height: 0,
    aspectRatio: 1,
};
export const useImagePicker = () => {
    const [selectedImage, setSelectedImage] = useState();
    const [dimensions, setDimensions] = useState(DEFAULT_DIMENSIONS);
    const hasSelectedImage = !!selectedImage;
    const pickImage = async () => {
        const result = await ImagePicker.launchImageLibraryAsync(options);
        if (result.canceled) {
            return;
        }
        const { uri } = result.assets[0];
        setSelectedImage(uri);
        Image.getSize(uri, (width, height) => setDimensions({ width, height, aspectRatio: width / height }), logger.error);
    };
    return {
        pickImage,
        hasSelectedImage,
        selectedImage,
        dimensions,
    };
};
//# sourceMappingURL=use-image-picker.js.map