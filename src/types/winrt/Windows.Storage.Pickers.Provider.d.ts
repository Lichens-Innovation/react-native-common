//tslint:disable

declare namespace Windows.Storage.Pickers.Provider {
    enum AddFileResult {
        added = 0,
        alreadyAdded = 1,
        notAllowed = 2,
        unavailable = 3,
    }

    class FileOpenPickerUI {
        public title: string;
        public readonly allowedFileTypes: any;
        public readonly selectionMode: Windows.Storage.Pickers.Provider.FileSelectionMode;
        public readonly settingsIdentifier: string;
        public addFile(id: string, file: Windows.Storage.IStorageFile): Windows.Storage.Pickers.Provider.AddFileResult;
        public removeFile(id: string): void;
        public containsFile(id: string): boolean;
        public canAddFile(file: Windows.Storage.IStorageFile): boolean;
        public addEventListener(type: "closing", listener: any): void;
        public removeEventListener(type: "closing", listener: any): void;
    }

    class FileSavePickerUI {
        public title: string;
        public readonly allowedFileTypes: any;
        public readonly fileName: string;
        public readonly settingsIdentifier: string;
        public trySetFileName(value: string): Windows.Storage.Pickers.Provider.SetFileNameResult;
        public addEventListener(type: "filenamechanged", listener: any): void;
        public removeEventListener(type: "filenamechanged", listener: any): void;
        public addEventListener(type: "targetfilerequested", listener: any): void;
        public removeEventListener(type: "targetfilerequested", listener: any): void;
    }

    enum FileSelectionMode {
        single = 0,
        multiple = 1,
    }

    class PickerClosingDeferral {
        public complete(): void;
    }

    class PickerClosingEventArgs {
        public readonly closingOperation: Windows.Storage.Pickers.Provider.PickerClosingOperation;
        public readonly isCanceled: boolean;
    }

    class PickerClosingOperation {
        public readonly deadline: any;
        public getDeferral(): Windows.Storage.Pickers.Provider.PickerClosingDeferral;
    }

    enum SetFileNameResult {
        succeeded = 0,
        notAllowed = 1,
        unavailable = 2,
    }

    class TargetFileRequest {
        public targetFile: Windows.Storage.IStorageFile;
        public getDeferral(): Windows.Storage.Pickers.Provider.TargetFileRequestDeferral;
    }

    class TargetFileRequestDeferral {
        public complete(): void;
    }

    class TargetFileRequestedEventArgs {
        public readonly request: Windows.Storage.Pickers.Provider.TargetFileRequest;
    }

}