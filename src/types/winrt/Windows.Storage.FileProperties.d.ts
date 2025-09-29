//tslint:disable

declare namespace Windows.Storage.FileProperties {
    class BasicProperties implements Windows.Storage.FileProperties.IStorageItemExtraProperties {
        public readonly dateModified: any;
        public readonly itemDate: any;
        public readonly size: number;
        public retrievePropertiesAsync(propertiesToRetrieve: any): any;
        public savePropertiesAsync(propertiesToSave: any): any;
        public savePropertiesAsync(): any;
    }

    class DocumentProperties implements Windows.Storage.FileProperties.IStorageItemExtraProperties {
        public title: string;
        public comment: string;
        public readonly author: any;
        public readonly keywords: any;
        public retrievePropertiesAsync(propertiesToRetrieve: any): any;
        public savePropertiesAsync(propertiesToSave: any): any;
        public savePropertiesAsync(): any;
    }

    abstract class GeotagHelper {
        public static getGeotagAsync(file: Windows.Storage.IStorageFile): any;
        public static setGeotagFromGeolocatorAsync(file: Windows.Storage.IStorageFile, geolocator: any): any;
        public static setGeotagAsync(file: Windows.Storage.IStorageFile, geopoint: any): any;
    }

    interface IStorageItemExtraProperties {
        retrievePropertiesAsync(propertiesToRetrieve: any): any;
        savePropertiesAsync(propertiesToSave: any): any;
        savePropertiesAsync(): any;
    }

    class ImageProperties implements Windows.Storage.FileProperties.IStorageItemExtraProperties {
        public title: string;
        public rating: number;
        public dateTaken: any;
        public cameraModel: string;
        public cameraManufacturer: string;
        public readonly height: number;
        public readonly keywords: any;
        public readonly latitude: any;
        public readonly longitude: any;
        public readonly orientation: Windows.Storage.FileProperties.PhotoOrientation;
        public readonly peopleNames: any;
        public readonly width: number;
        public retrievePropertiesAsync(propertiesToRetrieve: any): any;
        public savePropertiesAsync(propertiesToSave: any): any;
        public savePropertiesAsync(): any;
    }

    class MusicProperties implements Windows.Storage.FileProperties.IStorageItemExtraProperties {
        public year: number;
        public trackNumber: number;
        public title: string;
        public subtitle: string;
        public rating: number;
        public publisher: string;
        public artist: string;
        public albumArtist: string;
        public album: string;
        public readonly bitrate: number;
        public readonly composers: any;
        public readonly conductors: any;
        public readonly duration: any;
        public readonly genre: any;
        public readonly producers: any;
        public readonly writers: any;
        public retrievePropertiesAsync(propertiesToRetrieve: any): any;
        public savePropertiesAsync(propertiesToSave: any): any;
        public savePropertiesAsync(): any;
    }

    enum PhotoOrientation {
        unspecified = 0,
        normal = 1,
        flipHorizontal = 2,
        rotate180 = 3,
        flipVertical = 4,
        transpose = 5,
        rotate270 = 6,
        transverse = 7,
        rotate90 = 8,
    }

    enum PropertyPrefetchOptions {
        none = 0,
        musicProperties = 1,
        videoProperties = 2,
        imageProperties = 4,
        documentProperties = 8,
        basicProperties = 16,
    }

    class StorageItemContentProperties implements Windows.Storage.FileProperties.IStorageItemExtraProperties {
        public getMusicPropertiesAsync(): any;
        public getVideoPropertiesAsync(): any;
        public getImagePropertiesAsync(): any;
        public getDocumentPropertiesAsync(): any;
        public retrievePropertiesAsync(propertiesToRetrieve: any): any;
        public savePropertiesAsync(propertiesToSave: any): any;
        public savePropertiesAsync(): any;
    }

    class StorageItemThumbnail implements Windows.Storage.Streams.IRandomAccessStreamWithContentType, Windows.Storage.Streams.IContentTypeProvider, Windows.Storage.Streams.IRandomAccessStream, Windows.Storage.Streams.IOutputStream, any, Windows.Storage.Streams.IInputStream {
        public readonly originalHeight: number;
        public readonly originalWidth: number;
        public readonly returnedSmallerCachedSize: boolean;
        public readonly type: Windows.Storage.FileProperties.ThumbnailType;
        public readonly contentType: string;
        public size: number;
        public readonly canRead: boolean;
        public readonly canWrite: boolean;
        public readonly position: number;
        public getInputStreamAt(position: number): Windows.Storage.Streams.IInputStream;
        public getOutputStreamAt(position: number): Windows.Storage.Streams.IOutputStream;
        public seek(position: number): void;
        public cloneStream(): Windows.Storage.Streams.IRandomAccessStream;
        public close(): void;
        public readAsync(buffer: Windows.Storage.Streams.IBuffer, count: number, options: Windows.Storage.Streams.InputStreamOptions): any;
        public writeAsync(buffer: Windows.Storage.Streams.IBuffer): any;
        public flushAsync(): any;
    }

    enum ThumbnailMode {
        picturesView = 0,
        videosView = 1,
        musicView = 2,
        documentsView = 3,
        listView = 4,
        singleItem = 5,
    }

    enum ThumbnailOptions {
        none = 0,
        returnOnlyIfCached = 1,
        resizeThumbnail = 2,
        useCurrentScale = 4,
    }

    enum ThumbnailType {
        image = 0,
        icon = 1,
    }

    enum VideoOrientation {
        normal = 0,
        rotate90 = 90,
        rotate180 = 180,
        rotate270 = 270,
    }

    class VideoProperties implements Windows.Storage.FileProperties.IStorageItemExtraProperties {
        public year: number;
        public title: string;
        public subtitle: string;
        public rating: number;
        public publisher: string;
        public readonly bitrate: number;
        public readonly directors: any;
        public readonly duration: any;
        public readonly height: number;
        public readonly keywords: any;
        public readonly latitude: any;
        public readonly longitude: any;
        public readonly orientation: Windows.Storage.FileProperties.VideoOrientation;
        public readonly producers: any;
        public readonly width: number;
        public readonly writers: any;
        public retrievePropertiesAsync(propertiesToRetrieve: any): any;
        public savePropertiesAsync(propertiesToSave: any): any;
        public savePropertiesAsync(): any;
    }

}