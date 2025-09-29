export interface SingleFile {
    name: string;
    uri: string;
    size?: number;
    mimeType?: string;
    lastModified?: number;
}
interface UseSingleFileSelectorArgs {
    mimeTypes?: string[];
    copyToCacheDirectory?: boolean;
}
export declare const useSingleFileSelector: ({ mimeTypes, copyToCacheDirectory }: UseSingleFileSelectorArgs) => {
    selectedFile: SingleFile | undefined;
    handleFileSelection: () => Promise<void>;
    hasSelectedFile: boolean;
};
export {};
