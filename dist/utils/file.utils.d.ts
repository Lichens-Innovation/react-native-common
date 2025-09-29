export declare const isFileExists: (fileUri?: string) => Promise<boolean>;
export declare const getFilenameOnly: (fileUri?: string) => string | undefined;
export declare const getFileExtensionOnly: (fileUri?: string) => string | undefined;
export declare const getDirectoryOnly: (fileUri?: string) => string;
export declare const getDocumentFolderRelativePath: (fileUri?: string) => string;
export declare const getDocumentFullFilename: (filename?: string) => string;
export declare const createDirectoryStructure: (folderUri?: string) => Promise<{
    exists: boolean;
    error?: undefined;
} | {
    exists: boolean;
    error: unknown;
}>;
export interface FileMutationResult {
    exists: boolean;
    error?: unknown;
}
export declare const saveTextContent: ({ fileUri, text }: {
    fileUri?: string | undefined;
    text?: string | undefined;
}) => Promise<FileMutationResult>;
export interface LoadTextContentResult {
    exists: boolean;
    content?: string;
    error?: unknown;
}
export declare const loadTextContent: (fileUri?: string) => Promise<LoadTextContentResult>;
export declare const deleteFile: (fileUri?: string) => Promise<FileMutationResult>;
export declare const nowAsIsoFilename: () => string;
export declare const isFileUri: (uri: string) => boolean;
