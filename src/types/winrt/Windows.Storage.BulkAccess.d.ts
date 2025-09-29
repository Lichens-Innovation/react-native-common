//tslint:disable

declare namespace Windows.Storage.BulkAccess {
    class FileInformation implements Windows.Storage.BulkAccess.IStorageItemInformation, Windows.Storage.IStorageFile, Windows.Storage.Streams.IInputStreamReference, Windows.Storage.Streams.IRandomAccessStreamReference, Windows.Storage.IStorageItem, Windows.Storage.IStorageItemProperties, Windows.Storage.IStorageItem2, Windows.Storage.IStorageItemPropertiesWithProvider, Windows.Storage.IStorageFilePropertiesWithAvailability, Windows.Storage.IStorageFile2 {
        public readonly basicProperties: Windows.Storage.FileProperties.BasicProperties;
        public readonly documentProperties: Windows.Storage.FileProperties.DocumentProperties;
        public readonly imageProperties: Windows.Storage.FileProperties.ImageProperties;
        public readonly musicProperties: Windows.Storage.FileProperties.MusicProperties;
        public readonly thumbnail: Windows.Storage.FileProperties.StorageItemThumbnail;
        public readonly videoProperties: Windows.Storage.FileProperties.VideoProperties;
        public readonly contentType: string;
        public readonly fileType: string;
        public readonly isAvailable: boolean;
        public readonly attributes: Windows.Storage.FileAttributes;
        public readonly dateCreated: any;
        public readonly name: string;
        public readonly path: string;
        public readonly displayName: string;
        public readonly displayType: string;
        public readonly folderRelativeId: string;
        public readonly properties: Windows.Storage.FileProperties.StorageItemContentProperties;
        public readonly provider: Windows.Storage.StorageProvider;
        public openAsync(accessMode: Windows.Storage.FileAccessMode): any;
        public openTransactedWriteAsync(): any;
        public copyAsync(destinationFolder: Windows.Storage.IStorageFolder): any;
        public copyAsync(destinationFolder: Windows.Storage.IStorageFolder, desiredNewName: string): any;
        public copyAsync(destinationFolder: Windows.Storage.IStorageFolder, desiredNewName: string, option: Windows.Storage.NameCollisionOption): any;
        public copyAndReplaceAsync(fileToReplace: Windows.Storage.IStorageFile): any;
        public moveAsync(destinationFolder: Windows.Storage.IStorageFolder): any;
        public moveAsync(destinationFolder: Windows.Storage.IStorageFolder, desiredNewName: string): any;
        public moveAsync(destinationFolder: Windows.Storage.IStorageFolder, desiredNewName: string, option: Windows.Storage.NameCollisionOption): any;
        public moveAndReplaceAsync(fileToReplace: Windows.Storage.IStorageFile): any;
        public renameAsync(desiredName: string): any;
        public renameAsync(desiredName: string, option: Windows.Storage.NameCollisionOption): any;
        public deleteAsync(): any;
        public deleteAsync(option: Windows.Storage.StorageDeleteOption): any;
        public getBasicPropertiesAsync(): any;
        public isOfType(type: Windows.Storage.StorageItemTypes): boolean;
        public openReadAsync(): any;
        public openSequentialReadAsync(): any;
        public getThumbnailAsync(mode: Windows.Storage.FileProperties.ThumbnailMode): any;
        public getThumbnailAsync(mode: Windows.Storage.FileProperties.ThumbnailMode, requestedSize: number): any;
        public getThumbnailAsync(mode: Windows.Storage.FileProperties.ThumbnailMode, requestedSize: number, options: Windows.Storage.FileProperties.ThumbnailOptions): any;
        public getParentAsync(): any;
        public isEqual(item: Windows.Storage.IStorageItem): boolean;
        public openAsync(accessMode: Windows.Storage.FileAccessMode, options: Windows.Storage.StorageOpenOptions): any;
        public openTransactedWriteAsync(options: Windows.Storage.StorageOpenOptions): any;
        public addEventListener(type: "thumbnailupdated", listener: any): void;
        public removeEventListener(type: "thumbnailupdated", listener: any): void;
        public addEventListener(type: "propertiesupdated", listener: any): void;
        public removeEventListener(type: "propertiesupdated", listener: any): void;
    }

    class FileInformationFactory {
        public constructor(queryResult: Windows.Storage.Search.IStorageQueryResultBase, mode: Windows.Storage.FileProperties.ThumbnailMode);
        public constructor(queryResult: Windows.Storage.Search.IStorageQueryResultBase, mode: Windows.Storage.FileProperties.ThumbnailMode, requestedThumbnailSize: number);
        public constructor(queryResult: Windows.Storage.Search.IStorageQueryResultBase, mode: Windows.Storage.FileProperties.ThumbnailMode, requestedThumbnailSize: number, thumbnailOptions: Windows.Storage.FileProperties.ThumbnailOptions);
        public constructor(queryResult: Windows.Storage.Search.IStorageQueryResultBase, mode: Windows.Storage.FileProperties.ThumbnailMode, requestedThumbnailSize: number, thumbnailOptions: Windows.Storage.FileProperties.ThumbnailOptions, delayLoad: boolean);
        public getItemsAsync(startIndex: number, maxItemsToRetrieve: number): any;
        public getItemsAsync(): any;
        public getFilesAsync(startIndex: number, maxItemsToRetrieve: number): any;
        public getFilesAsync(): any;
        public getFoldersAsync(startIndex: number, maxItemsToRetrieve: number): any;
        public getFoldersAsync(): any;
        public getVirtualizedItemsVector(): any;
        public getVirtualizedFilesVector(): any;
        public getVirtualizedFoldersVector(): any;
    }

    class FolderInformation implements Windows.Storage.BulkAccess.IStorageItemInformation, Windows.Storage.IStorageFolder, Windows.Storage.IStorageItem, Windows.Storage.IStorageItemProperties, Windows.Storage.Search.IStorageFolderQueryOperations, Windows.Storage.IStorageItem2, Windows.Storage.IStorageFolder2, Windows.Storage.IStorageItemPropertiesWithProvider {
        public readonly basicProperties: Windows.Storage.FileProperties.BasicProperties;
        public readonly documentProperties: Windows.Storage.FileProperties.DocumentProperties;
        public readonly imageProperties: Windows.Storage.FileProperties.ImageProperties;
        public readonly musicProperties: Windows.Storage.FileProperties.MusicProperties;
        public readonly thumbnail: Windows.Storage.FileProperties.StorageItemThumbnail;
        public readonly videoProperties: Windows.Storage.FileProperties.VideoProperties;
        public readonly attributes: Windows.Storage.FileAttributes;
        public readonly dateCreated: any;
        public readonly name: string;
        public readonly path: string;
        public readonly displayName: string;
        public readonly displayType: string;
        public readonly folderRelativeId: string;
        public readonly properties: Windows.Storage.FileProperties.StorageItemContentProperties;
        public readonly provider: Windows.Storage.StorageProvider;
        public createFileAsync(desiredName: string): any;
        public createFileAsync(desiredName: string, options: Windows.Storage.CreationCollisionOption): any;
        public createFolderAsync(desiredName: string): any;
        public createFolderAsync(desiredName: string, options: Windows.Storage.CreationCollisionOption): any;
        public getFileAsync(name: string): any;
        public getFolderAsync(name: string): any;
        public getItemAsync(name: string): any;
        public getFilesAsync(): any;
        public getFoldersAsync(): any;
        public getItemsAsync(): any;
        public renameAsync(desiredName: string): any;
        public renameAsync(desiredName: string, option: Windows.Storage.NameCollisionOption): any;
        public deleteAsync(): any;
        public deleteAsync(option: Windows.Storage.StorageDeleteOption): any;
        public getBasicPropertiesAsync(): any;
        public isOfType(type: Windows.Storage.StorageItemTypes): boolean;
        public getThumbnailAsync(mode: Windows.Storage.FileProperties.ThumbnailMode): any;
        public getThumbnailAsync(mode: Windows.Storage.FileProperties.ThumbnailMode, requestedSize: number): any;
        public getThumbnailAsync(mode: Windows.Storage.FileProperties.ThumbnailMode, requestedSize: number, options: Windows.Storage.FileProperties.ThumbnailOptions): any;
        public getIndexedStateAsync(): any;
        public createFileQuery(): Windows.Storage.Search.StorageFileQueryResult;
        public createFileQuery(query: Windows.Storage.Search.CommonFileQuery): Windows.Storage.Search.StorageFileQueryResult;
        public createFileQueryWithOptions(queryOptions: Windows.Storage.Search.QueryOptions): Windows.Storage.Search.StorageFileQueryResult;
        public createFolderQuery(): Windows.Storage.Search.StorageFolderQueryResult;
        public createFolderQuery(query: Windows.Storage.Search.CommonFolderQuery): Windows.Storage.Search.StorageFolderQueryResult;
        public createFolderQueryWithOptions(queryOptions: Windows.Storage.Search.QueryOptions): Windows.Storage.Search.StorageFolderQueryResult;
        public createItemQuery(): Windows.Storage.Search.StorageItemQueryResult;
        public createItemQueryWithOptions(queryOptions: Windows.Storage.Search.QueryOptions): Windows.Storage.Search.StorageItemQueryResult;
        public getFilesAsync(query: Windows.Storage.Search.CommonFileQuery, startIndex: number, maxItemsToRetrieve: number): any;
        public getFilesAsync(query: Windows.Storage.Search.CommonFileQuery): any;
        public getFoldersAsync(query: Windows.Storage.Search.CommonFolderQuery, startIndex: number, maxItemsToRetrieve: number): any;
        public getFoldersAsync(query: Windows.Storage.Search.CommonFolderQuery): any;
        public getItemsAsync(startIndex: number, maxItemsToRetrieve: number): any;
        public areQueryOptionsSupported(queryOptions: Windows.Storage.Search.QueryOptions): boolean;
        public isCommonFolderQuerySupported(query: Windows.Storage.Search.CommonFolderQuery): boolean;
        public isCommonFileQuerySupported(query: Windows.Storage.Search.CommonFileQuery): boolean;
        public getParentAsync(): any;
        public isEqual(item: Windows.Storage.IStorageItem): boolean;
        public tryGetItemAsync(name: string): any;
        public addEventListener(type: "thumbnailupdated", listener: any): void;
        public removeEventListener(type: "thumbnailupdated", listener: any): void;
        public addEventListener(type: "propertiesupdated", listener: any): void;
        public removeEventListener(type: "propertiesupdated", listener: any): void;
    }

    interface IStorageItemInformation {
        readonly basicProperties: Windows.Storage.FileProperties.BasicProperties;
        readonly documentProperties: Windows.Storage.FileProperties.DocumentProperties;
        readonly imageProperties: Windows.Storage.FileProperties.ImageProperties;
        readonly musicProperties: Windows.Storage.FileProperties.MusicProperties;
        readonly thumbnail: Windows.Storage.FileProperties.StorageItemThumbnail;
        readonly videoProperties: Windows.Storage.FileProperties.VideoProperties;
        addEventListener(type: "thumbnailupdated", listener: any): void;
        removeEventListener(type: "thumbnailupdated", listener: any): void;
        addEventListener(type: "propertiesupdated", listener: any): void;
        removeEventListener(type: "propertiesupdated", listener: any): void;
    }

}