//tslint:disable

declare namespace Windows.Storage {
    class AppDataPaths {
        public readonly cookies: string;
        public readonly desktop: string;
        public readonly documents: string;
        public readonly favorites: string;
        public readonly history: string;
        public readonly internetCache: string;
        public readonly localAppData: string;
        public readonly programData: string;
        public readonly roamingAppData: string;
        public static getForUser(user: any): Windows.Storage.AppDataPaths;
        public static getDefault(): Windows.Storage.AppDataPaths;
    }

    class ApplicationData {
        public readonly localFolder: Windows.Storage.StorageFolder;
        public readonly localSettings: Windows.Storage.ApplicationDataContainer;
        public readonly roamingFolder: Windows.Storage.StorageFolder;
        public readonly roamingSettings: Windows.Storage.ApplicationDataContainer;
        public readonly roamingStorageQuota: number;
        public readonly temporaryFolder: Windows.Storage.StorageFolder;
        public readonly version: number;
        public readonly localCacheFolder: Windows.Storage.StorageFolder;
        public readonly sharedLocalFolder: Windows.Storage.StorageFolder;
        public static readonly current: Windows.Storage.ApplicationData;
        public setVersionAsync(desiredVersion: number, handler: Windows.Storage.ApplicationDataSetVersionHandler): any;
        public clearAsync(): any;
        public clearAsync(locality: Windows.Storage.ApplicationDataLocality): any;
        public signalDataChanged(): void;
        public getPublisherCacheFolder(folderName: string): Windows.Storage.StorageFolder;
        public clearPublisherCacheFolderAsync(folderName: string): any;
        public static getForUserAsync(user: any): any;
        public addEventListener(type: "datachanged", listener: any): void;
        public removeEventListener(type: "datachanged", listener: any): void;
    }

    class ApplicationDataCompositeValue implements any, any, any, any {
        public readonly size: number;
        public constructor();
        public lookup(key: string): any;
        public hasKey(key: string): boolean;
        public getView(): any;
        public insert(key: string, value: any): boolean;
        public remove(key: string): void;
        public clear(): void;
        public first(): any;
        public addEventListener(type: "mapchanged", listener: any): void;
        public removeEventListener(type: "mapchanged", listener: any): void;
    }

    class ApplicationDataContainer {
        public readonly containers: any;
        public readonly locality: Windows.Storage.ApplicationDataLocality;
        public readonly name: string;
        public readonly values: any;
        public createContainer(name: string, disposition: Windows.Storage.ApplicationDataCreateDisposition): Windows.Storage.ApplicationDataContainer;
        public deleteContainer(name: string): void;
    }

    class ApplicationDataContainerSettings implements any, any, any, any {
        public readonly size: number;
        public lookup(key: string): any;
        public hasKey(key: string): boolean;
        public getView(): any;
        public insert(key: string, value: any): boolean;
        public remove(key: string): void;
        public clear(): void;
        public first(): any;
        public addEventListener(type: "mapchanged", listener: any): void;
        public removeEventListener(type: "mapchanged", listener: any): void;
    }

    enum ApplicationDataCreateDisposition {
        always = 0,
        existing = 1,
    }

    enum ApplicationDataLocality {
        local = 0,
        roaming = 1,
        temporary = 2,
        localCache = 3,
    }

    type ApplicationDataSetVersionHandler = (setVersionRequest: Windows.Storage.SetVersionRequest) => void;
    
    abstract class CachedFileManager {
        public static deferUpdates(file: Windows.Storage.IStorageFile): void;
        public static completeUpdatesAsync(file: Windows.Storage.IStorageFile): any;
    }

    enum CreationCollisionOption {
        generateUniqueName = 0,
        replaceExisting = 1,
        failIfExists = 2,
        openIfExists = 3,
    }

    abstract class DownloadsFolder {
        public static createFileForUserAsync(user: any, desiredName: string): any;
        public static createFolderForUserAsync(user: any, desiredName: string): any;
        public static createFileForUserAsync(user: any, desiredName: string, option: Windows.Storage.CreationCollisionOption): any;
        public static createFolderForUserAsync(user: any, desiredName: string, option: Windows.Storage.CreationCollisionOption): any;
        public static createFileAsync(desiredName: string): any;
        public static createFolderAsync(desiredName: string): any;
        public static createFileAsync(desiredName: string, option: Windows.Storage.CreationCollisionOption): any;
        public static createFolderAsync(desiredName: string, option: Windows.Storage.CreationCollisionOption): any;
    }

    enum FileAccessMode {
        read = 0,
        readWrite = 1,
    }

    enum FileAttributes {
        normal = 0,
        readOnly = 1,
        directory = 16,
        archive = 32,
        temporary = 256,
        locallyIncomplete = 512,
    }

    abstract class FileIO {
        public static readTextAsync(file: Windows.Storage.IStorageFile): any;
        public static readTextAsync(file: Windows.Storage.IStorageFile, encoding: Windows.Storage.Streams.UnicodeEncoding): any;
        public static writeTextAsync(file: Windows.Storage.IStorageFile, contents: string): any;
        public static writeTextAsync(file: Windows.Storage.IStorageFile, contents: string, encoding: Windows.Storage.Streams.UnicodeEncoding): any;
        public static appendTextAsync(file: Windows.Storage.IStorageFile, contents: string): any;
        public static appendTextAsync(file: Windows.Storage.IStorageFile, contents: string, encoding: Windows.Storage.Streams.UnicodeEncoding): any;
        public static readLinesAsync(file: Windows.Storage.IStorageFile): any;
        public static readLinesAsync(file: Windows.Storage.IStorageFile, encoding: Windows.Storage.Streams.UnicodeEncoding): any;
        public static writeLinesAsync(file: Windows.Storage.IStorageFile, lines: any): any;
        public static writeLinesAsync(file: Windows.Storage.IStorageFile, lines: any, encoding: Windows.Storage.Streams.UnicodeEncoding): any;
        public static appendLinesAsync(file: Windows.Storage.IStorageFile, lines: any): any;
        public static appendLinesAsync(file: Windows.Storage.IStorageFile, lines: any, encoding: Windows.Storage.Streams.UnicodeEncoding): any;
        public static readBufferAsync(file: Windows.Storage.IStorageFile): any;
        public static writeBufferAsync(file: Windows.Storage.IStorageFile, buffer: Windows.Storage.Streams.IBuffer): any;
        public static writeBytesAsync(file: Windows.Storage.IStorageFile, buffer: number[]): any;
    }

    interface IStorageFile extends Windows.Storage.IStorageItem, Windows.Storage.Streams.IRandomAccessStreamReference, Windows.Storage.Streams.IInputStreamReference {
        readonly contentType: string;
        readonly fileType: string;
        openAsync(accessMode: Windows.Storage.FileAccessMode): any;
        openTransactedWriteAsync(): any;
        copyAsync(destinationFolder: Windows.Storage.IStorageFolder): any;
        copyAsync(destinationFolder: Windows.Storage.IStorageFolder, desiredNewName: string): any;
        copyAsync(destinationFolder: Windows.Storage.IStorageFolder, desiredNewName: string, option: Windows.Storage.NameCollisionOption): any;
        copyAndReplaceAsync(fileToReplace: Windows.Storage.IStorageFile): any;
        moveAsync(destinationFolder: Windows.Storage.IStorageFolder): any;
        moveAsync(destinationFolder: Windows.Storage.IStorageFolder, desiredNewName: string): any;
        moveAsync(destinationFolder: Windows.Storage.IStorageFolder, desiredNewName: string, option: Windows.Storage.NameCollisionOption): any;
        moveAndReplaceAsync(fileToReplace: Windows.Storage.IStorageFile): any;
    }

    interface IStorageFile2 {
        openAsync(accessMode: Windows.Storage.FileAccessMode, options: Windows.Storage.StorageOpenOptions): any;
        openTransactedWriteAsync(options: Windows.Storage.StorageOpenOptions): any;
    }

    interface IStorageFilePropertiesWithAvailability {
        readonly isAvailable: boolean;
    }

    interface IStorageFolder extends Windows.Storage.IStorageItem {
        createFileAsync(desiredName: string): any;
        createFileAsync(desiredName: string, options: Windows.Storage.CreationCollisionOption): any;
        createFolderAsync(desiredName: string): any;
        createFolderAsync(desiredName: string, options: Windows.Storage.CreationCollisionOption): any;
        getFileAsync(name: string): any;
        getFolderAsync(name: string): any;
        getItemAsync(name: string): any;
        getFilesAsync(): any;
        getFoldersAsync(): any;
        getItemsAsync(): any;
    }

    interface IStorageFolder2 {
        tryGetItemAsync(name: string): any;
    }

    interface IStorageItem {
        readonly attributes: Windows.Storage.FileAttributes;
        readonly dateCreated: any;
        readonly name: string;
        readonly path: string;
        renameAsync(desiredName: string): any;
        renameAsync(desiredName: string, option: Windows.Storage.NameCollisionOption): any;
        deleteAsync(): any;
        deleteAsync(option: Windows.Storage.StorageDeleteOption): any;
        getBasicPropertiesAsync(): any;
        isOfType(type: Windows.Storage.StorageItemTypes): boolean;
    }

    interface IStorageItem2 extends Windows.Storage.IStorageItem {
        getParentAsync(): any;
        isEqual(item: Windows.Storage.IStorageItem): boolean;
    }

    interface IStorageItemProperties {
        readonly displayName: string;
        readonly displayType: string;
        readonly folderRelativeId: string;
        readonly properties: Windows.Storage.FileProperties.StorageItemContentProperties;
        getThumbnailAsync(mode: Windows.Storage.FileProperties.ThumbnailMode): any;
        getThumbnailAsync(mode: Windows.Storage.FileProperties.ThumbnailMode, requestedSize: number): any;
        getThumbnailAsync(mode: Windows.Storage.FileProperties.ThumbnailMode, requestedSize: number, options: Windows.Storage.FileProperties.ThumbnailOptions): any;
    }

    interface IStorageItemProperties2 extends Windows.Storage.IStorageItemProperties {
        getScaledImageAsThumbnailAsync(mode: Windows.Storage.FileProperties.ThumbnailMode): any;
        getScaledImageAsThumbnailAsync(mode: Windows.Storage.FileProperties.ThumbnailMode, requestedSize: number): any;
        getScaledImageAsThumbnailAsync(mode: Windows.Storage.FileProperties.ThumbnailMode, requestedSize: number, options: Windows.Storage.FileProperties.ThumbnailOptions): any;
    }

    interface IStorageItemPropertiesWithProvider extends Windows.Storage.IStorageItemProperties {
        readonly provider: Windows.Storage.StorageProvider;
    }

    interface IStreamedFileDataRequest {
        failAndClose(failureMode: Windows.Storage.StreamedFileFailureMode): void;
    }

    enum KnownFolderId {
        appCaptures = 0,
        cameraRoll = 1,
        documentsLibrary = 2,
        homeGroup = 3,
        mediaServerDevices = 4,
        musicLibrary = 5,
        objects3D = 6,
        picturesLibrary = 7,
        playlists = 8,
        recordedCalls = 9,
        removableDevices = 10,
        savedPictures = 11,
        screenshots = 12,
        videosLibrary = 13,
        allAppMods = 14,
        currentAppMods = 15,
    }

    abstract class KnownFolders {
        public static readonly cameraRoll: Windows.Storage.StorageFolder;
        public static readonly playlists: Windows.Storage.StorageFolder;
        public static readonly savedPictures: Windows.Storage.StorageFolder;
        public static readonly documentsLibrary: Windows.Storage.StorageFolder;
        public static readonly homeGroup: Windows.Storage.StorageFolder;
        public static readonly mediaServerDevices: Windows.Storage.StorageFolder;
        public static readonly musicLibrary: Windows.Storage.StorageFolder;
        public static readonly picturesLibrary: Windows.Storage.StorageFolder;
        public static readonly removableDevices: Windows.Storage.StorageFolder;
        public static readonly videosLibrary: Windows.Storage.StorageFolder;
        public static readonly appCaptures: Windows.Storage.StorageFolder;
        public static readonly objects3D: Windows.Storage.StorageFolder;
        public static readonly recordedCalls: Windows.Storage.StorageFolder;
        public static requestAccessAsync(folderId: Windows.Storage.KnownFolderId): any;
        public static requestAccessForUserAsync(user: any, folderId: Windows.Storage.KnownFolderId): any;
        public static getFolderAsync(folderId: Windows.Storage.KnownFolderId): any;
        public static getFolderForUserAsync(user: any, folderId: Windows.Storage.KnownFolderId): any;
    }

    enum KnownFoldersAccessStatus {
        deniedBySystem = 0,
        notDeclaredByApp = 1,
        deniedByUser = 2,
        userPromptRequired = 3,
        allowed = 4,
    }

    enum KnownLibraryId {
        music = 0,
        pictures = 1,
        videos = 2,
        documents = 3,
    }

    enum NameCollisionOption {
        generateUniqueName = 0,
        replaceExisting = 1,
        failIfExists = 2,
    }

    abstract class PathIO {
        public static readTextAsync(absolutePath: string): any;
        public static readTextAsync(absolutePath: string, encoding: Windows.Storage.Streams.UnicodeEncoding): any;
        public static writeTextAsync(absolutePath: string, contents: string): any;
        public static writeTextAsync(absolutePath: string, contents: string, encoding: Windows.Storage.Streams.UnicodeEncoding): any;
        public static appendTextAsync(absolutePath: string, contents: string): any;
        public static appendTextAsync(absolutePath: string, contents: string, encoding: Windows.Storage.Streams.UnicodeEncoding): any;
        public static readLinesAsync(absolutePath: string): any;
        public static readLinesAsync(absolutePath: string, encoding: Windows.Storage.Streams.UnicodeEncoding): any;
        public static writeLinesAsync(absolutePath: string, lines: any): any;
        public static writeLinesAsync(absolutePath: string, lines: any, encoding: Windows.Storage.Streams.UnicodeEncoding): any;
        public static appendLinesAsync(absolutePath: string, lines: any): any;
        public static appendLinesAsync(absolutePath: string, lines: any, encoding: Windows.Storage.Streams.UnicodeEncoding): any;
        public static readBufferAsync(absolutePath: string): any;
        public static writeBufferAsync(absolutePath: string, buffer: Windows.Storage.Streams.IBuffer): any;
        public static writeBytesAsync(absolutePath: string, buffer: number[]): any;
    }

    class SetVersionDeferral {
        public complete(): void;
    }

    class SetVersionRequest {
        public readonly currentVersion: number;
        public readonly desiredVersion: number;
        public getDeferral(): Windows.Storage.SetVersionDeferral;
    }

    enum StorageDeleteOption {
        default = 0,
        permanentDelete = 1,
    }

    class StorageFile implements Windows.Storage.IStorageFile, Windows.Storage.Streams.IInputStreamReference, Windows.Storage.Streams.IRandomAccessStreamReference, Windows.Storage.IStorageItem, Windows.Storage.IStorageItemProperties, Windows.Storage.IStorageItemProperties2, Windows.Storage.IStorageItem2, Windows.Storage.IStorageItemPropertiesWithProvider, Windows.Storage.IStorageFilePropertiesWithAvailability, Windows.Storage.IStorageFile2 {
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
        public getScaledImageAsThumbnailAsync(mode: Windows.Storage.FileProperties.ThumbnailMode): any;
        public getScaledImageAsThumbnailAsync(mode: Windows.Storage.FileProperties.ThumbnailMode, requestedSize: number): any;
        public getScaledImageAsThumbnailAsync(mode: Windows.Storage.FileProperties.ThumbnailMode, requestedSize: number, options: Windows.Storage.FileProperties.ThumbnailOptions): any;
        public getParentAsync(): any;
        public isEqual(item: Windows.Storage.IStorageItem): boolean;
        public openAsync(accessMode: Windows.Storage.FileAccessMode, options: Windows.Storage.StorageOpenOptions): any;
        public openTransactedWriteAsync(options: Windows.Storage.StorageOpenOptions): any;
        public static getFileFromPathForUserAsync(user: any, path: string): any;
        public static getFileFromPathAsync(path: string): any;
        public static getFileFromApplicationUriAsync(uri: any): any;
        public static createStreamedFileAsync(displayNameWithExtension: string, dataRequested: Windows.Storage.StreamedFileDataRequestedHandler, thumbnail: Windows.Storage.Streams.IRandomAccessStreamReference): any;
        public static replaceWithStreamedFileAsync(fileToReplace: Windows.Storage.IStorageFile, dataRequested: Windows.Storage.StreamedFileDataRequestedHandler, thumbnail: Windows.Storage.Streams.IRandomAccessStreamReference): any;
        public static createStreamedFileFromUriAsync(displayNameWithExtension: string, uri: any, thumbnail: Windows.Storage.Streams.IRandomAccessStreamReference): any;
        public static replaceWithStreamedFileFromUriAsync(fileToReplace: Windows.Storage.IStorageFile, uri: any, thumbnail: Windows.Storage.Streams.IRandomAccessStreamReference): any;
    }

    class StorageFolder implements Windows.Storage.IStorageFolder, Windows.Storage.IStorageItem, Windows.Storage.Search.IStorageFolderQueryOperations, Windows.Storage.IStorageItemProperties, Windows.Storage.IStorageItemProperties2, Windows.Storage.IStorageItem2, Windows.Storage.IStorageFolder2, Windows.Storage.IStorageItemPropertiesWithProvider {
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
        public getThumbnailAsync(mode: Windows.Storage.FileProperties.ThumbnailMode): any;
        public getThumbnailAsync(mode: Windows.Storage.FileProperties.ThumbnailMode, requestedSize: number): any;
        public getThumbnailAsync(mode: Windows.Storage.FileProperties.ThumbnailMode, requestedSize: number, options: Windows.Storage.FileProperties.ThumbnailOptions): any;
        public getScaledImageAsThumbnailAsync(mode: Windows.Storage.FileProperties.ThumbnailMode): any;
        public getScaledImageAsThumbnailAsync(mode: Windows.Storage.FileProperties.ThumbnailMode, requestedSize: number): any;
        public getScaledImageAsThumbnailAsync(mode: Windows.Storage.FileProperties.ThumbnailMode, requestedSize: number, options: Windows.Storage.FileProperties.ThumbnailOptions): any;
        public getParentAsync(): any;
        public isEqual(item: Windows.Storage.IStorageItem): boolean;
        public tryGetItemAsync(name: string): any;
        public tryGetChangeTracker(): Windows.Storage.StorageLibraryChangeTracker;
        public static getFolderFromPathForUserAsync(user: any, path: string): any;
        public static getFolderFromPathAsync(path: string): any;
    }

    enum StorageItemTypes {
        none = 0,
        file = 1,
        folder = 2,
    }

    class StorageLibrary {
        public readonly folders: any;
        public readonly saveFolder: Windows.Storage.StorageFolder;
        public readonly changeTracker: Windows.Storage.StorageLibraryChangeTracker;
        public requestAddFolderAsync(): any;
        public requestRemoveFolderAsync(folder: Windows.Storage.StorageFolder): any;
        public areFolderSuggestionsAvailableAsync(): any;
        public static getLibraryForUserAsync(user: any, libraryId: Windows.Storage.KnownLibraryId): any;
        public static getLibraryAsync(libraryId: Windows.Storage.KnownLibraryId): any;
        public addEventListener(type: "definitionchanged", listener: any): void;
        public removeEventListener(type: "definitionchanged", listener: any): void;
    }

    class StorageLibraryChange {
        public readonly changeType: Windows.Storage.StorageLibraryChangeType;
        public readonly path: string;
        public readonly previousPath: string;
        public isOfType(type: Windows.Storage.StorageItemTypes): boolean;
        public getStorageItemAsync(): any;
    }

    class StorageLibraryChangeReader {
        public readBatchAsync(): any;
        public acceptChangesAsync(): any;
    }

    class StorageLibraryChangeTracker {
        public getChangeReader(): Windows.Storage.StorageLibraryChangeReader;
        public enable(): void;
        public reset(): void;
    }

    enum StorageLibraryChangeType {
        created = 0,
        deleted = 1,
        movedOrRenamed = 2,
        contentsChanged = 3,
        movedOutOfLibrary = 4,
        movedIntoLibrary = 5,
        contentsReplaced = 6,
        indexingStatusChanged = 7,
        encryptionChanged = 8,
        changeTrackingLost = 9,
    }

    enum StorageOpenOptions {
        none = 0,
        allowOnlyReaders = 1,
        allowReadersAndWriters = 2,
    }

    class StorageProvider {
        public readonly displayName: string;
        public readonly id: string;
        public isPropertySupportedForPartialFileAsync(propertyCanonicalName: string): any;
    }

    class StorageStreamTransaction implements any {
        public readonly stream: Windows.Storage.Streams.IRandomAccessStream;
        public commitAsync(): any;
        public close(): void;
    }

    class StreamedFileDataRequest implements Windows.Storage.Streams.IOutputStream, any, Windows.Storage.IStreamedFileDataRequest {
        public writeAsync(buffer: Windows.Storage.Streams.IBuffer): any;
        public flushAsync(): any;
        public close(): void;
        public failAndClose(failureMode: Windows.Storage.StreamedFileFailureMode): void;
    }

    type StreamedFileDataRequestedHandler = (stream: Windows.Storage.StreamedFileDataRequest) => void;
    
    enum StreamedFileFailureMode {
        failed = 0,
        currentlyUnavailable = 1,
        incomplete = 2,
    }

    class SystemAudioProperties {
        public readonly encodingBitrate: string;
    }

    class SystemDataPaths {
        public readonly fonts: string;
        public readonly programData: string;
        public readonly public: string;
        public readonly publicDesktop: string;
        public readonly publicDocuments: string;
        public readonly publicDownloads: string;
        public readonly publicMusic: string;
        public readonly publicPictures: string;
        public readonly publicVideos: string;
        public readonly system: string;
        public readonly systemArm: string;
        public readonly systemHost: string;
        public readonly systemX64: string;
        public readonly systemX86: string;
        public readonly userProfiles: string;
        public readonly windows: string;
        public static getDefault(): Windows.Storage.SystemDataPaths;
    }

    class SystemGPSProperties {
        public readonly latitudeDecimal: string;
        public readonly longitudeDecimal: string;
    }

    class SystemImageProperties {
        public readonly horizontalSize: string;
        public readonly verticalSize: string;
    }

    class SystemMediaProperties {
        public readonly duration: string;
        public readonly producer: string;
        public readonly publisher: string;
        public readonly subTitle: string;
        public readonly writer: string;
        public readonly year: string;
    }

    class SystemMusicProperties {
        public readonly albumArtist: string;
        public readonly albumTitle: string;
        public readonly artist: string;
        public readonly composer: string;
        public readonly conductor: string;
        public readonly displayArtist: string;
        public readonly genre: string;
        public readonly trackNumber: string;
    }

    class SystemPhotoProperties {
        public readonly cameraManufacturer: string;
        public readonly cameraModel: string;
        public readonly dateTaken: string;
        public readonly orientation: string;
        public readonly peopleNames: string;
    }

    abstract class SystemProperties {
        public static readonly audio: Windows.Storage.SystemAudioProperties;
        public static readonly author: string;
        public static readonly comment: string;
        public static readonly gPS: Windows.Storage.SystemGPSProperties;
        public static readonly image: Windows.Storage.SystemImageProperties;
        public static readonly itemNameDisplay: string;
        public static readonly keywords: string;
        public static readonly media: Windows.Storage.SystemMediaProperties;
        public static readonly music: Windows.Storage.SystemMusicProperties;
        public static readonly photo: Windows.Storage.SystemPhotoProperties;
        public static readonly rating: string;
        public static readonly title: string;
        public static readonly video: Windows.Storage.SystemVideoProperties;
    }

    class SystemVideoProperties {
        public readonly director: string;
        public readonly frameHeight: string;
        public readonly frameWidth: string;
        public readonly orientation: string;
        public readonly totalBitrate: string;
    }

    class UserDataPaths {
        public readonly cameraRoll: string;
        public readonly cookies: string;
        public readonly desktop: string;
        public readonly documents: string;
        public readonly downloads: string;
        public readonly favorites: string;
        public readonly history: string;
        public readonly internetCache: string;
        public readonly localAppData: string;
        public readonly localAppDataLow: string;
        public readonly music: string;
        public readonly pictures: string;
        public readonly profile: string;
        public readonly recent: string;
        public readonly roamingAppData: string;
        public readonly savedPictures: string;
        public readonly screenshots: string;
        public readonly templates: string;
        public readonly videos: string;
        public static getForUser(user: any): Windows.Storage.UserDataPaths;
        public static getDefault(): Windows.Storage.UserDataPaths;
    }

}