//tslint:disable

declare namespace Windows.Storage.Search {
    enum CommonFileQuery {
        defaultQuery = 0,
        orderByName = 1,
        orderByTitle = 2,
        orderByMusicProperties = 3,
        orderBySearchRank = 4,
        orderByDate = 5,
    }

    enum CommonFolderQuery {
        defaultQuery = 0,
        groupByYear = 100,
        groupByMonth = 101,
        groupByArtist = 102,
        groupByAlbum = 103,
        groupByAlbumArtist = 104,
        groupByComposer = 105,
        groupByGenre = 106,
        groupByPublishedYear = 107,
        groupByRating = 108,
        groupByTag = 109,
        groupByAuthor = 110,
        groupByType = 111,
    }

    class ContentIndexer {
        public readonly revision: number;
        public addAsync(indexableContent: Windows.Storage.Search.IIndexableContent): any;
        public updateAsync(indexableContent: Windows.Storage.Search.IIndexableContent): any;
        public deleteAsync(contentId: string): any;
        public deleteMultipleAsync(contentIds: any): any;
        public deleteAllAsync(): any;
        public retrievePropertiesAsync(contentId: string, propertiesToRetrieve: any): any;
        public createQuery(searchFilter: string, propertiesToRetrieve: any, sortOrder: any, searchFilterLanguage: string): Windows.Storage.Search.ContentIndexerQuery;
        public createQuery(searchFilter: string, propertiesToRetrieve: any, sortOrder: any): Windows.Storage.Search.ContentIndexerQuery;
        public createQuery(searchFilter: string, propertiesToRetrieve: any): Windows.Storage.Search.ContentIndexerQuery;
        public static getIndexer(indexName: string): Windows.Storage.Search.ContentIndexer;
        public static getIndexer(): Windows.Storage.Search.ContentIndexer;
    }

    class ContentIndexerQuery {
        public readonly queryFolder: Windows.Storage.StorageFolder;
        public getCountAsync(): any;
        public getPropertiesAsync(): any;
        public getPropertiesAsync(startIndex: number, maxItems: number): any;
        public getAsync(): any;
        public getAsync(startIndex: number, maxItems: number): any;
    }

    enum DateStackOption {
        none = 0,
        year = 1,
        month = 2,
    }

    enum FolderDepth {
        shallow = 0,
        deep = 1,
    }

    interface IIndexableContent {
        id: string;
        readonly properties: any;
        stream: Windows.Storage.Streams.IRandomAccessStream;
        streamContentType: string;
    }

    interface IStorageFolderQueryOperations {
        getIndexedStateAsync(): any;
        createFileQuery(): Windows.Storage.Search.StorageFileQueryResult;
        createFileQuery(query: Windows.Storage.Search.CommonFileQuery): Windows.Storage.Search.StorageFileQueryResult;
        createFileQueryWithOptions(queryOptions: Windows.Storage.Search.QueryOptions): Windows.Storage.Search.StorageFileQueryResult;
        createFolderQuery(): Windows.Storage.Search.StorageFolderQueryResult;
        createFolderQuery(query: Windows.Storage.Search.CommonFolderQuery): Windows.Storage.Search.StorageFolderQueryResult;
        createFolderQueryWithOptions(queryOptions: Windows.Storage.Search.QueryOptions): Windows.Storage.Search.StorageFolderQueryResult;
        createItemQuery(): Windows.Storage.Search.StorageItemQueryResult;
        createItemQueryWithOptions(queryOptions: Windows.Storage.Search.QueryOptions): Windows.Storage.Search.StorageItemQueryResult;
        getFilesAsync(query: Windows.Storage.Search.CommonFileQuery, startIndex: number, maxItemsToRetrieve: number): any;
        getFilesAsync(query: Windows.Storage.Search.CommonFileQuery): any;
        getFoldersAsync(query: Windows.Storage.Search.CommonFolderQuery, startIndex: number, maxItemsToRetrieve: number): any;
        getFoldersAsync(query: Windows.Storage.Search.CommonFolderQuery): any;
        getItemsAsync(startIndex: number, maxItemsToRetrieve: number): any;
        areQueryOptionsSupported(queryOptions: Windows.Storage.Search.QueryOptions): boolean;
        isCommonFolderQuerySupported(query: Windows.Storage.Search.CommonFolderQuery): boolean;
        isCommonFileQuerySupported(query: Windows.Storage.Search.CommonFileQuery): boolean;
    }

    interface IStorageQueryResultBase {
        readonly folder: Windows.Storage.StorageFolder;
        getItemCountAsync(): any;
        findStartIndexAsync(value: any): any;
        getCurrentQueryOptions(): Windows.Storage.Search.QueryOptions;
        applyNewQueryOptions(newQueryOptions: Windows.Storage.Search.QueryOptions): void;
        addEventListener(type: "contentschanged", listener: any): void;
        removeEventListener(type: "contentschanged", listener: any): void;
        addEventListener(type: "optionschanged", listener: any): void;
        removeEventListener(type: "optionschanged", listener: any): void;
    }

    class IndexableContent implements Windows.Storage.Search.IIndexableContent {
        public streamContentType: string;
        public stream: Windows.Storage.Streams.IRandomAccessStream;
        public id: string;
        public readonly properties: any;
        public constructor();
    }

    enum IndexedState {
        unknown = 0,
        notIndexed = 1,
        partiallyIndexed = 2,
        fullyIndexed = 3,
    }

    enum IndexerOption {
        useIndexerWhenAvailable = 0,
        onlyUseIndexer = 1,
        doNotUseIndexer = 2,
        onlyUseIndexerAndOptimizeForIndexedProperties = 3,
    }

    class QueryOptions {
        public userSearchFilter: string;
        public language: string;
        public indexerOption: Windows.Storage.Search.IndexerOption;
        public folderDepth: Windows.Storage.Search.FolderDepth;
        public applicationSearchFilter: string;
        public readonly dateStackOption: Windows.Storage.Search.DateStackOption;
        public readonly fileTypeFilter: any;
        public readonly groupPropertyName: string;
        public readonly sortOrder: any;
        public readonly storageProviderIdFilter: any;
        public constructor(query: Windows.Storage.Search.CommonFileQuery, fileTypeFilter: any);
        public constructor(query: Windows.Storage.Search.CommonFolderQuery);
        public constructor();
        public saveToString(): string;
        public loadFromString(value: string): void;
        public setThumbnailPrefetch(mode: Windows.Storage.FileProperties.ThumbnailMode, requestedSize: number, options: Windows.Storage.FileProperties.ThumbnailOptions): void;
        public setPropertyPrefetch(options: Windows.Storage.FileProperties.PropertyPrefetchOptions, propertiesToRetrieve: any): void;
    }

    interface SortEntry {
        propertyName: string;
        ascendingOrder: boolean;
    }

    class SortEntryVector implements any, any {
        public readonly size: number;
        public getAt(index: number): Windows.Storage.Search.SortEntry;
        public getView(): any;
        public indexOf(value: Windows.Storage.Search.SortEntry): { index: number; returnValue: boolean };
        public setAt(index: number, value: Windows.Storage.Search.SortEntry): void;
        public insertAt(index: number, value: Windows.Storage.Search.SortEntry): void;
        public removeAt(index: number): void;
        public append(value: Windows.Storage.Search.SortEntry): void;
        public removeAtEnd(): void;
        public clear(): void;
        public getMany(startIndex: number, items: Windows.Storage.Search.SortEntry[]): number;
        public replaceAll(items: Windows.Storage.Search.SortEntry[]): void;
        public first(): any;
    }

    class StorageFileQueryResult implements Windows.Storage.Search.IStorageQueryResultBase {
        public readonly folder: Windows.Storage.StorageFolder;
        public getFilesAsync(startIndex: number, maxNumberOfItems: number): any;
        public getFilesAsync(): any;
        public getItemCountAsync(): any;
        public findStartIndexAsync(value: any): any;
        public getCurrentQueryOptions(): Windows.Storage.Search.QueryOptions;
        public applyNewQueryOptions(newQueryOptions: Windows.Storage.Search.QueryOptions): void;
        public getMatchingPropertiesWithRanges(file: Windows.Storage.StorageFile): any;
        public addEventListener(type: "contentschanged", listener: any): void;
        public removeEventListener(type: "contentschanged", listener: any): void;
        public addEventListener(type: "optionschanged", listener: any): void;
        public removeEventListener(type: "optionschanged", listener: any): void;
    }

    class StorageFolderQueryResult implements Windows.Storage.Search.IStorageQueryResultBase {
        public readonly folder: Windows.Storage.StorageFolder;
        public getFoldersAsync(startIndex: number, maxNumberOfItems: number): any;
        public getFoldersAsync(): any;
        public getItemCountAsync(): any;
        public findStartIndexAsync(value: any): any;
        public getCurrentQueryOptions(): Windows.Storage.Search.QueryOptions;
        public applyNewQueryOptions(newQueryOptions: Windows.Storage.Search.QueryOptions): void;
        public addEventListener(type: "contentschanged", listener: any): void;
        public removeEventListener(type: "contentschanged", listener: any): void;
        public addEventListener(type: "optionschanged", listener: any): void;
        public removeEventListener(type: "optionschanged", listener: any): void;
    }

    class StorageItemQueryResult implements Windows.Storage.Search.IStorageQueryResultBase {
        public readonly folder: Windows.Storage.StorageFolder;
        public getItemsAsync(startIndex: number, maxNumberOfItems: number): any;
        public getItemsAsync(): any;
        public getItemCountAsync(): any;
        public findStartIndexAsync(value: any): any;
        public getCurrentQueryOptions(): Windows.Storage.Search.QueryOptions;
        public applyNewQueryOptions(newQueryOptions: Windows.Storage.Search.QueryOptions): void;
        public addEventListener(type: "contentschanged", listener: any): void;
        public removeEventListener(type: "contentschanged", listener: any): void;
        public addEventListener(type: "optionschanged", listener: any): void;
        public removeEventListener(type: "optionschanged", listener: any): void;
    }

    class StorageLibraryChangeTrackerTriggerDetails {
        public readonly changeTracker: Windows.Storage.StorageLibraryChangeTracker;
        public readonly folder: Windows.Storage.StorageFolder;
    }

    class StorageLibraryContentChangedTriggerDetails {
        public readonly folder: Windows.Storage.StorageFolder;
        public createModifiedSinceQuery(lastQueryTime: any): Windows.Storage.Search.StorageItemQueryResult;
    }

    class ValueAndLanguage {
        public value: any;
        public language: string;
        public constructor();
    }

}