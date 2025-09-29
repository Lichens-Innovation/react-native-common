//tslint:disable

declare namespace Windows.Storage.AccessCache {
    enum AccessCacheOptions {
        none = 0,
        disallowUserInput = 1,
        fastLocationsOnly = 2,
        useReadOnlyCachedCopy = 4,
        suppressAccessTimeUpdate = 8,
    }

    interface AccessListEntry {
        token: string;
        metadata: string;
    }

    class AccessListEntryView implements any, any {
        public readonly size: number;
        public getAt(index: number): Windows.Storage.AccessCache.AccessListEntry;
        public indexOf(value: Windows.Storage.AccessCache.AccessListEntry): { index: number; returnValue: boolean };
        public getMany(startIndex: number, items: Windows.Storage.AccessCache.AccessListEntry[]): number;
        public first(): any;
    }

    interface IStorageItemAccessList {
        readonly entries: Windows.Storage.AccessCache.AccessListEntryView;
        readonly maximumItemsAllowed: number;
        add(file: Windows.Storage.IStorageItem): string;
        add(file: Windows.Storage.IStorageItem, metadata: string): string;
        addOrReplace(token: string, file: Windows.Storage.IStorageItem): void;
        addOrReplace(token: string, file: Windows.Storage.IStorageItem, metadata: string): void;
        getItemAsync(token: string): any;
        getFileAsync(token: string): any;
        getFolderAsync(token: string): any;
        getItemAsync(token: string, options: Windows.Storage.AccessCache.AccessCacheOptions): any;
        getFileAsync(token: string, options: Windows.Storage.AccessCache.AccessCacheOptions): any;
        getFolderAsync(token: string, options: Windows.Storage.AccessCache.AccessCacheOptions): any;
        remove(token: string): void;
        containsItem(token: string): boolean;
        clear(): void;
        checkAccess(file: Windows.Storage.IStorageItem): boolean;
    }

    class ItemRemovedEventArgs {
        public readonly removedEntry: Windows.Storage.AccessCache.AccessListEntry;
    }

    enum RecentStorageItemVisibility {
        appOnly = 0,
        appAndSystem = 1,
    }

    abstract class StorageApplicationPermissions {
        public static readonly futureAccessList: Windows.Storage.AccessCache.StorageItemAccessList;
        public static readonly mostRecentlyUsedList: Windows.Storage.AccessCache.StorageItemMostRecentlyUsedList;
        public static getFutureAccessListForUser(user: any): Windows.Storage.AccessCache.StorageItemAccessList;
        public static getMostRecentlyUsedListForUser(user: any): Windows.Storage.AccessCache.StorageItemMostRecentlyUsedList;
    }

    class StorageItemAccessList implements Windows.Storage.AccessCache.IStorageItemAccessList {
        public readonly entries: Windows.Storage.AccessCache.AccessListEntryView;
        public readonly maximumItemsAllowed: number;
        public add(file: Windows.Storage.IStorageItem): string;
        public add(file: Windows.Storage.IStorageItem, metadata: string): string;
        public addOrReplace(token: string, file: Windows.Storage.IStorageItem): void;
        public addOrReplace(token: string, file: Windows.Storage.IStorageItem, metadata: string): void;
        public getItemAsync(token: string): any;
        public getFileAsync(token: string): any;
        public getFolderAsync(token: string): any;
        public getItemAsync(token: string, options: Windows.Storage.AccessCache.AccessCacheOptions): any;
        public getFileAsync(token: string, options: Windows.Storage.AccessCache.AccessCacheOptions): any;
        public getFolderAsync(token: string, options: Windows.Storage.AccessCache.AccessCacheOptions): any;
        public remove(token: string): void;
        public containsItem(token: string): boolean;
        public clear(): void;
        public checkAccess(file: Windows.Storage.IStorageItem): boolean;
    }

    class StorageItemMostRecentlyUsedList implements Windows.Storage.AccessCache.IStorageItemAccessList {
        public readonly entries: Windows.Storage.AccessCache.AccessListEntryView;
        public readonly maximumItemsAllowed: number;
        public add(file: Windows.Storage.IStorageItem): string;
        public add(file: Windows.Storage.IStorageItem, metadata: string): string;
        public addOrReplace(token: string, file: Windows.Storage.IStorageItem): void;
        public addOrReplace(token: string, file: Windows.Storage.IStorageItem, metadata: string): void;
        public getItemAsync(token: string): any;
        public getFileAsync(token: string): any;
        public getFolderAsync(token: string): any;
        public getItemAsync(token: string, options: Windows.Storage.AccessCache.AccessCacheOptions): any;
        public getFileAsync(token: string, options: Windows.Storage.AccessCache.AccessCacheOptions): any;
        public getFolderAsync(token: string, options: Windows.Storage.AccessCache.AccessCacheOptions): any;
        public remove(token: string): void;
        public containsItem(token: string): boolean;
        public clear(): void;
        public checkAccess(file: Windows.Storage.IStorageItem): boolean;
        public add(file: Windows.Storage.IStorageItem, metadata: string, visibility: Windows.Storage.AccessCache.RecentStorageItemVisibility): string;
        public addOrReplace(token: string, file: Windows.Storage.IStorageItem, metadata: string, visibility: Windows.Storage.AccessCache.RecentStorageItemVisibility): void;
        public addEventListener(type: "itemremoved", listener: any): void;
        public removeEventListener(type: "itemremoved", listener: any): void;
    }

}