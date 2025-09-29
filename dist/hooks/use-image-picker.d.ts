export interface ImageDimensions {
    width: number;
    height: number;
    aspectRatio: number;
}
export declare const useImagePicker: () => {
    pickImage: () => Promise<void>;
    hasSelectedImage: boolean;
    selectedImage: string | undefined;
    dimensions: ImageDimensions;
};
