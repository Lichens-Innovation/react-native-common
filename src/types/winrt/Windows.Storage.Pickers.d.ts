//tslint:disable

declare namespace Windows.Storage.Pickers {
    class FileExtensionVector implements any, any {
        public readonly size: number;
        public getAt(index: number): string;
        public getView(): any;
        public indexOf(value: string): { index: number; returnValue: boolean };
        public setAt(index: number, value: string): void;
        public insertAt(index: number, value: string): void;
        public removeAt(index: number): void;
        public append(value: string): void;
        public removeAtEnd(): void;
        public clear(): void;
        public getMany(startIndex: number, items: string[]): number;
        public replaceAll(items: string[]): void;
        public first(): any;
    }

    class FileOpenPicker {
        public viewMode: Windows.Storage.Pickers.PickerViewMode;
        public suggestedStartLocation: Windows.Storage.Pickers.PickerLocationId;
        public settingsIdentifier: string;
        public commitButtonText: string;
        public readonly fileTypeFilter: any;
        public readonly continuationData: any;
        public readonly user: any;
        public constructor();
        public pickSingleFileAsync(pickerOperationId: string): any;
        public pickSingleFileAsync(): any;
        public pickMultipleFilesAsync(): any;
        public static createForUser(user: any): Windows.Storage.Pickers.FileOpenPicker;
    }

    class FilePickerFileTypesOrderedMap implements any, any {
        public readonly size: number;
        public lookup(key: string): any;
        public hasKey(key: string): boolean;
        public getView(): any;
        public insert(key: string, value: any): boolean;
        public remove(key: string): void;
        public clear(): void;
        public first(): any;
    }

    class FilePickerSelectedFilesArray implements any, any {
        public readonly size: number;
        public getAt(index: number): Windows.Storage.StorageFile;
        public indexOf(value: Windows.Storage.StorageFile): { index: number; returnValue: boolean };
        public getMany(startIndex: number, items: Windows.Storage.StorageFile[]): number;
        public first(): any;
    }

    class FileSavePicker {
        public suggestedStartLocation: Windows.Storage.Pickers.PickerLocationId;
        public suggestedSaveFile: Windows.Storage.StorageFile;
        public suggestedFileName: string;
        public settingsIdentifier: string;
        public defaultFileExtension: string;
        public commitButtonText: string;
        public readonly fileTypeChoices: any;
        public readonly continuationData: any;
        public enterpriseId: string;
        public readonly user: any;
        public constructor();
        public pickSaveFileAsync(): any;
        public static createForUser(user: any): Windows.Storage.Pickers.FileSavePicker;
    }

    class FolderPicker {
        public viewMode: Windows.Storage.Pickers.PickerViewMode;
        public suggestedStartLocation: Windows.Storage.Pickers.PickerLocationId;
        public settingsIdentifier: string;
        public commitButtonText: string;
        public readonly fileTypeFilter: any;
        public readonly continuationData: any;
        public readonly user: any;
        public constructor();
        public pickSingleFolderAsync(): any;
        public static createForUser(user: any): Windows.Storage.Pickers.FolderPicker;
    }

    enum PickerLocationId {
        documentsLibrary = 0,
        computerFolder = 1,
        desktop = 2,
        downloads = 3,
        homeGroup = 4,
        musicLibrary = 5,
        picturesLibrary = 6,
        videosLibrary = 7,
        objects3D = 8,
        unspecified = 9,
    }

    enum PickerViewMode {
        list = 0,
        thumbnail = 1,
    }

}