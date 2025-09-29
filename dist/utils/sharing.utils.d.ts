export declare const shareTextFile: (fileUri?: string) => Promise<void>;
export declare const shareXmlFile: (fileUri?: string) => Promise<void>;
interface ShareFileArgs {
    fileUri?: string;
    mimeType?: string;
}
export declare const shareFile: ({ fileUri, mimeType }: ShareFileArgs) => Promise<void>;
export declare const shareCurrentLogsFile: () => Promise<void>;
export {};
