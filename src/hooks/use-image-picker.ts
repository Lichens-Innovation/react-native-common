import * as ImagePicker from 'expo-image-picker';
import { useState } from 'react';
import { Image } from 'react-native';
import { logger } from '../logger/logger';

const options = {
  mediaTypes: ['images', 'livePhotos'] as ImagePicker.MediaType[],
  allowsEditing: true,
  quality: 1,
};

export interface ImageDimensions {
  width: number;
  height: number;
  aspectRatio: number;
}

const DEFAULT_DIMENSIONS: ImageDimensions = {
  width: 0,
  height: 0,
  aspectRatio: 1,
};

export const useImagePicker = () => {
  const [selectedImage, setSelectedImage] = useState<string>();
  const [dimensions, setDimensions] = useState<ImageDimensions>(DEFAULT_DIMENSIONS);

  const hasSelectedImage: boolean = !!selectedImage;

  const pickImage = async () => {
    const result = await ImagePicker.launchImageLibraryAsync(options);
    if (result.canceled) {
      return;
    }

    const { uri } = result.assets[0];
    setSelectedImage(uri);

    Image.getSize(
      uri,
      (width, height) => setDimensions({ width, height, aspectRatio: width / height }),
      logger.error
    );
  };

  return {
    pickImage,
    hasSelectedImage,
    selectedImage,
    dimensions,
  };
};
