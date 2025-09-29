//tslint:disable

declare namespace Windows.Storage.Provider {
    enum CachedFileOptions {
        none = 0,
        requireUpdateOnAccess = 1,
        useCachedFileWhenOffline = 2,
        denyAccessWhenOffline = 4,
    }

    enum CachedFileTarget {
        local = 0,
        remote = 1,
    }

    abstract class CachedFileUpdater {
        public static setUpdateInformation(file: Windows.Storage.IStorageFile, contentId: string, readMode: Windows.Storage.Provider.ReadActivationMode, writeMode: Windows.Storage.Provider.WriteActivationMode, options: Windows.Storage.Provider.CachedFileOptions): void;
    }

    class CachedFileUpdaterUI {
        public title: string;
        public readonly uIStatus: Windows.Storage.Provider.UIStatus;
        public readonly updateTarget: Windows.Storage.Provider.CachedFileTarget;
        public readonly updateRequest: Windows.Storage.Provider.FileUpdateRequest;
        public getDeferral(): Windows.Storage.Provider.FileUpdateRequestDeferral;
        public addEventListener(type: "fileupdaterequested", listener: any): void;
        public removeEventListener(type: "fileupdaterequested", listener: any): void;
        public addEventListener(type: "uirequested", listener: any): void;
        public removeEventListener(type: "uirequested", listener: any): void;
    }

    interface CloudFilesContract {
    }

    class FileUpdateRequest {
        public status: Windows.Storage.Provider.FileUpdateStatus;
        public readonly contentId: string;
        public readonly file: Windows.Storage.StorageFile;
        public userInputNeededMessage: string;
        public getDeferral(): Windows.Storage.Provider.FileUpdateRequestDeferral;
        public updateLocalFile(value: Windows.Storage.IStorageFile): void;
    }

    class FileUpdateRequestDeferral {
        public complete(): void;
    }

    class FileUpdateRequestedEventArgs {
        public readonly request: Windows.Storage.Provider.FileUpdateRequest;
    }

    enum FileUpdateStatus {
        incomplete = 0,
        complete = 1,
        userInputNeeded = 2,
        currentlyUnavailable = 3,
        failed = 4,
        completeAndRenamed = 5,
    }

    interface IStorageProviderItemPropertySource {
        getItemProperties(itemPath: string): any;
    }

    interface IStorageProviderKnownFolderSyncInfoSource {
        getKnownFolderSyncInfo(): Windows.Storage.Provider.StorageProviderKnownFolderSyncInfo;
        addEventListener(type: "knownfoldersyncinfochanged", listener: any): void;
        removeEventListener(type: "knownfoldersyncinfochanged", listener: any): void;
    }

    interface IStorageProviderKnownFolderSyncInfoSourceFactory {
        getKnownFolderSyncInfoSource(): Windows.Storage.Provider.IStorageProviderKnownFolderSyncInfoSource;
    }

    interface IStorageProviderPropertyCapabilities {
        isPropertySupported(propertyCanonicalName: string): boolean;
    }

    interface IStorageProviderStatusUISource {
        getStatusUI(): Windows.Storage.Provider.StorageProviderStatusUI;
        addEventListener(type: "statusuichanged", listener: any): void;
        removeEventListener(type: "statusuichanged", listener: any): void;
    }

    interface IStorageProviderStatusUISourceFactory {
        getStatusUISource(syncRootId: string): Windows.Storage.Provider.IStorageProviderStatusUISource;
    }

    interface IStorageProviderUICommand {
        readonly description: string;
        readonly icon: any;
        readonly label: string;
        readonly state: Windows.Storage.Provider.StorageProviderUICommandState;
        invoke(): void;
    }

    interface IStorageProviderUriSource {
        getPathForContentUri(contentUri: string, result: Windows.Storage.Provider.StorageProviderGetPathForContentUriResult): void;
        getContentInfoForPath(path: string, result: Windows.Storage.Provider.StorageProviderGetContentInfoForPathResult): void;
    }

    enum ReadActivationMode {
        notNeeded = 0,
        beforeAccess = 1,
    }

    class StorageProviderFileTypeInfo {
        public readonly fileExtension: string;
        public readonly iconResource: string;
        public constructor(fileExtension: string, iconResource: string);
    }

    class StorageProviderGetContentInfoForPathResult {
        public status: Windows.Storage.Provider.StorageProviderUriSourceStatus;
        public contentUri: string;
        public contentId: string;
        public constructor();
    }

    class StorageProviderGetPathForContentUriResult {
        public status: Windows.Storage.Provider.StorageProviderUriSourceStatus;
        public path: string;
        public constructor();
    }

    enum StorageProviderHardlinkPolicy {
        none = 0,
        allowed = 1,
    }

    enum StorageProviderHydrationPolicy {
        partial = 0,
        progressive = 1,
        full = 2,
        alwaysFull = 3,
    }

    enum StorageProviderHydrationPolicyModifier {
        none = 0,
        validationRequired = 1,
        streamingAllowed = 2,
        autoDehydrationAllowed = 4,
        allowFullRestartHydration = 8,
    }

    enum StorageProviderInSyncPolicy {
        default = 0,
        fileCreationTime = 1,
        fileReadOnlyAttribute = 2,
        fileHiddenAttribute = 4,
        fileSystemAttribute = 8,
        directoryCreationTime = 16,
        directoryReadOnlyAttribute = 32,
        directoryHiddenAttribute = 64,
        directorySystemAttribute = 128,
        fileLastWriteTime = 256,
        directoryLastWriteTime = 512,
        preserveInsyncForSyncEngine = 2147483648,
    }

    abstract class StorageProviderItemProperties {
        public static setAsync(item: Windows.Storage.IStorageItem, itemProperties: any): any;
    }

    class StorageProviderItemProperty {
        public value: string;
        public id: number;
        public iconResource: string;
        public constructor();
    }

    class StorageProviderItemPropertyDefinition {
        public id: number;
        public displayNameResource: string;
        public constructor();
    }

    class StorageProviderKnownFolderEntry {
        public status: Windows.Storage.Provider.StorageProviderKnownFolderSyncStatus;
        public knownFolderId: string;
        public constructor();
    }

    class StorageProviderKnownFolderSyncInfo {
        public syncRequested: Windows.Storage.Provider.StorageProviderKnownFolderSyncRequestedHandler;
        public providerDisplayName: string;
        public readonly knownFolderEntries: any;
        public constructor();
    }

    class StorageProviderKnownFolderSyncRequestArgs {
        public readonly knownFolders: any;
        public readonly source: Windows.Storage.StorageFolder;
    }

    type StorageProviderKnownFolderSyncRequestedHandler = (args: Windows.Storage.Provider.StorageProviderKnownFolderSyncRequestArgs) => void;
    
    enum StorageProviderKnownFolderSyncStatus {
        available = 0,
        enrolling = 1,
        enrolled = 2,
    }

    class StorageProviderMoreInfoUI {
        public message: string;
        public command: Windows.Storage.Provider.IStorageProviderUICommand;
        public constructor();
    }

    enum StorageProviderPopulationPolicy {
        full = 1,
        alwaysFull = 2,
    }

    enum StorageProviderProtectionMode {
        unknown = 0,
        personal = 1,
    }

    class StorageProviderQuotaUI {
        public quotaUsedLabel: string;
        public quotaUsedInBytes: number;
        public quotaUsedColor: any;
        public quotaTotalInBytes: number;
        public constructor();
    }

    enum StorageProviderState {
        inSync = 0,
        syncing = 1,
        paused = 2,
        error = 3,
        warning = 4,
        offline = 5,
    }

    class StorageProviderStatusUI {
        public syncStatusCommand: Windows.Storage.Provider.IStorageProviderUICommand;
        public quotaUI: Windows.Storage.Provider.StorageProviderQuotaUI;
        public providerStateLabel: string;
        public providerStateIcon: any;
        public providerState: Windows.Storage.Provider.StorageProviderState;
        public providerSecondaryCommands: any;
        public providerPrimaryCommand: Windows.Storage.Provider.IStorageProviderUICommand;
        public moreInfoUI: Windows.Storage.Provider.StorageProviderMoreInfoUI;
        public constructor();
    }

    class StorageProviderSyncRootInfo {
        public version: string;
        public showSiblingsAsGroup: boolean;
        public recycleBinUri: any;
        public protectionMode: Windows.Storage.Provider.StorageProviderProtectionMode;
        public populationPolicy: Windows.Storage.Provider.StorageProviderPopulationPolicy;
        public path: Windows.Storage.IStorageFolder;
        public inSyncPolicy: Windows.Storage.Provider.StorageProviderInSyncPolicy;
        public id: string;
        public iconResource: string;
        public hydrationPolicyModifier: Windows.Storage.Provider.StorageProviderHydrationPolicyModifier;
        public hydrationPolicy: Windows.Storage.Provider.StorageProviderHydrationPolicy;
        public hardlinkPolicy: Windows.Storage.Provider.StorageProviderHardlinkPolicy;
        public displayNameResource: string;
        public context: Windows.Storage.Streams.IBuffer;
        public allowPinning: boolean;
        public readonly storageProviderItemPropertyDefinitions: any;
        public providerId: string;
        public readonly fallbackFileTypeInfo: any;
        public constructor();
    }

    abstract class StorageProviderSyncRootManager {
        public static isSupported(): boolean;
        public static register(syncRootInformation: Windows.Storage.Provider.StorageProviderSyncRootInfo): void;
        public static unregister(id: string): void;
        public static getSyncRootInformationForFolder(folder: Windows.Storage.IStorageFolder): Windows.Storage.Provider.StorageProviderSyncRootInfo;
        public static getSyncRootInformationForId(id: string): Windows.Storage.Provider.StorageProviderSyncRootInfo;
        public static getCurrentSyncRoots(): any;
    }

    enum StorageProviderUICommandState {
        enabled = 0,
        disabled = 1,
        hidden = 2,
    }

    enum StorageProviderUriSourceStatus {
        success = 0,
        noSyncRoot = 1,
        fileNotFound = 2,
    }

    enum UIStatus {
        unavailable = 0,
        hidden = 1,
        visible = 2,
        complete = 3,
    }

    enum WriteActivationMode {
        readOnly = 0,
        notNeeded = 1,
        afterWrite = 2,
    }

}