export declare const pickSingleFile: (options?: {
    type: string[];
    copyToCacheDirectory: boolean;
}) => Promise<{
    exists: boolean;
    error: string;
    name: string;
    uri: string;
    size: number;
    mimeType: string;
    lastModified: number;
} | {
    name: string;
    size?: number;
    uri: string;
    mimeType?: string;
    lastModified?: number;
    file?: File;
    exists: string;
    error?: undefined;
} | {
    error: unknown;
    exists: boolean;
    name?: undefined;
    uri?: undefined;
    size?: undefined;
    mimeType?: undefined;
    lastModified?: undefined;
}>;
