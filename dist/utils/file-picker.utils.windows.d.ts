export declare const pickSingleFile: () => Promise<{
    exists: boolean;
    error: string;
    name: string;
    uri: string;
    size: number;
    mimeType: string;
    lastModified: number;
}>;
