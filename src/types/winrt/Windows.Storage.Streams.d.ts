//tslint:disable

declare namespace Windows.Storage.Streams {
    class Buffer implements Windows.Storage.Streams.IBuffer {
        public length: number;
        public readonly capacity: number;
        public constructor(capacity: number);
        public static createCopyFromMemoryBuffer(input: any): Windows.Storage.Streams.Buffer;
        public static createMemoryBufferOverIBuffer(input: Windows.Storage.Streams.IBuffer): any;
    }

    enum ByteOrder {
        littleEndian = 0,
        bigEndian = 1,
    }

    class DataReader implements Windows.Storage.Streams.IDataReader, any {
        public unicodeEncoding: Windows.Storage.Streams.UnicodeEncoding;
        public inputStreamOptions: Windows.Storage.Streams.InputStreamOptions;
        public byteOrder: Windows.Storage.Streams.ByteOrder;
        public readonly unconsumedBufferLength: number;
        public constructor(inputStream: Windows.Storage.Streams.IInputStream);
        public readByte(): number;
        public readBytes(value: number[]): void;
        public readBuffer(length: number): Windows.Storage.Streams.IBuffer;
        public readBoolean(): boolean;
        public readGuid(): string;
        public readInt16(): number;
        public readInt32(): number;
        public readInt64(): number;
        public readUInt16(): number;
        public readUInt32(): number;
        public readUInt64(): number;
        public readSingle(): number;
        public readDouble(): number;
        public readString(codeUnitCount: number): string;
        public readDateTime(): any;
        public readTimeSpan(): any;
        public loadAsync(count: number): Windows.Storage.Streams.DataReaderLoadOperation;
        public detachBuffer(): Windows.Storage.Streams.IBuffer;
        public detachStream(): Windows.Storage.Streams.IInputStream;
        public close(): void;
        public static fromBuffer(buffer: Windows.Storage.Streams.IBuffer): Windows.Storage.Streams.DataReader;
    }

    class DataReaderLoadOperation implements any, any {
        public readonly errorCode: any;
        public readonly id: number;
        public readonly status: any;
        public completed: any;
        public getResults(): number;
        public cancel(): void;
        public close(): void;
    }

    class DataWriter implements Windows.Storage.Streams.IDataWriter, any {
        public unicodeEncoding: Windows.Storage.Streams.UnicodeEncoding;
        public byteOrder: Windows.Storage.Streams.ByteOrder;
        public readonly unstoredBufferLength: number;
        public constructor(outputStream: Windows.Storage.Streams.IOutputStream);
        public constructor();
        public writeByte(value: number): void;
        public writeBytes(value: number[]): void;
        public writeBuffer(buffer: Windows.Storage.Streams.IBuffer): void;
        public writeBuffer(buffer: Windows.Storage.Streams.IBuffer, start: number, count: number): void;
        public writeBoolean(value: boolean): void;
        public writeGuid(value: string): void;
        public writeInt16(value: number): void;
        public writeInt32(value: number): void;
        public writeInt64(value: number): void;
        public writeUInt16(value: number): void;
        public writeUInt32(value: number): void;
        public writeUInt64(value: number): void;
        public writeSingle(value: number): void;
        public writeDouble(value: number): void;
        public writeDateTime(value: any): void;
        public writeTimeSpan(value: any): void;
        public writeString(value: string): number;
        public measureString(value: string): number;
        public storeAsync(): Windows.Storage.Streams.DataWriterStoreOperation;
        public flushAsync(): any;
        public detachBuffer(): Windows.Storage.Streams.IBuffer;
        public detachStream(): Windows.Storage.Streams.IOutputStream;
        public close(): void;
    }

    class DataWriterStoreOperation implements any, any {
        public readonly errorCode: any;
        public readonly id: number;
        public readonly status: any;
        public completed: any;
        public getResults(): number;
        public cancel(): void;
        public close(): void;
    }

    class FileInputStream implements Windows.Storage.Streams.IInputStream, any {
        public readAsync(buffer: Windows.Storage.Streams.IBuffer, count: number, options: Windows.Storage.Streams.InputStreamOptions): any;
        public close(): void;
    }

    enum FileOpenDisposition {
        openExisting = 0,
        openAlways = 1,
        createNew = 2,
        createAlways = 3,
        truncateExisting = 4,
    }

    class FileOutputStream implements Windows.Storage.Streams.IOutputStream, any {
        public writeAsync(buffer: Windows.Storage.Streams.IBuffer): any;
        public flushAsync(): any;
        public close(): void;
    }

    class FileRandomAccessStream implements Windows.Storage.Streams.IRandomAccessStream, Windows.Storage.Streams.IOutputStream, any, Windows.Storage.Streams.IInputStream {
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
        public static openAsync(filePath: string, accessMode: Windows.Storage.FileAccessMode): any;
        public static openAsync(filePath: string, accessMode: Windows.Storage.FileAccessMode, sharingOptions: Windows.Storage.StorageOpenOptions, openDisposition: Windows.Storage.Streams.FileOpenDisposition): any;
        public static openTransactedWriteAsync(filePath: string): any;
        public static openTransactedWriteAsync(filePath: string, openOptions: Windows.Storage.StorageOpenOptions, openDisposition: Windows.Storage.Streams.FileOpenDisposition): any;
        public static openForUserAsync(user: any, filePath: string, accessMode: Windows.Storage.FileAccessMode): any;
        public static openForUserAsync(user: any, filePath: string, accessMode: Windows.Storage.FileAccessMode, sharingOptions: Windows.Storage.StorageOpenOptions, openDisposition: Windows.Storage.Streams.FileOpenDisposition): any;
        public static openTransactedWriteForUserAsync(user: any, filePath: string): any;
        public static openTransactedWriteForUserAsync(user: any, filePath: string, openOptions: Windows.Storage.StorageOpenOptions, openDisposition: Windows.Storage.Streams.FileOpenDisposition): any;
    }

    interface IBuffer {
        readonly capacity: number;
        length: number;
    }

    interface IContentTypeProvider {
        readonly contentType: string;
    }

    interface IDataReader {
        byteOrder: Windows.Storage.Streams.ByteOrder;
        inputStreamOptions: Windows.Storage.Streams.InputStreamOptions;
        readonly unconsumedBufferLength: number;
        unicodeEncoding: Windows.Storage.Streams.UnicodeEncoding;
        readByte(): number;
        readBytes(value: number[]): void;
        readBuffer(length: number): Windows.Storage.Streams.IBuffer;
        readBoolean(): boolean;
        readGuid(): string;
        readInt16(): number;
        readInt32(): number;
        readInt64(): number;
        readUInt16(): number;
        readUInt32(): number;
        readUInt64(): number;
        readSingle(): number;
        readDouble(): number;
        readString(codeUnitCount: number): string;
        readDateTime(): any;
        readTimeSpan(): any;
        loadAsync(count: number): Windows.Storage.Streams.DataReaderLoadOperation;
        detachBuffer(): Windows.Storage.Streams.IBuffer;
        detachStream(): Windows.Storage.Streams.IInputStream;
    }

    interface IDataWriter {
        byteOrder: Windows.Storage.Streams.ByteOrder;
        unicodeEncoding: Windows.Storage.Streams.UnicodeEncoding;
        readonly unstoredBufferLength: number;
        writeByte(value: number): void;
        writeBytes(value: number[]): void;
        writeBuffer(buffer: Windows.Storage.Streams.IBuffer): void;
        writeBuffer(buffer: Windows.Storage.Streams.IBuffer, start: number, count: number): void;
        writeBoolean(value: boolean): void;
        writeGuid(value: string): void;
        writeInt16(value: number): void;
        writeInt32(value: number): void;
        writeInt64(value: number): void;
        writeUInt16(value: number): void;
        writeUInt32(value: number): void;
        writeUInt64(value: number): void;
        writeSingle(value: number): void;
        writeDouble(value: number): void;
        writeDateTime(value: any): void;
        writeTimeSpan(value: any): void;
        writeString(value: string): number;
        measureString(value: string): number;
        storeAsync(): Windows.Storage.Streams.DataWriterStoreOperation;
        flushAsync(): any;
        detachBuffer(): Windows.Storage.Streams.IBuffer;
        detachStream(): Windows.Storage.Streams.IOutputStream;
    }

    interface IInputStream extends any {
        readAsync(buffer: Windows.Storage.Streams.IBuffer, count: number, options: Windows.Storage.Streams.InputStreamOptions): any;
    }

    interface IInputStreamReference {
        openSequentialReadAsync(): any;
    }

    interface IOutputStream extends any {
        writeAsync(buffer: Windows.Storage.Streams.IBuffer): any;
        flushAsync(): any;
    }

    interface IRandomAccessStream extends any, Windows.Storage.Streams.IInputStream, Windows.Storage.Streams.IOutputStream {
        readonly canRead: boolean;
        readonly canWrite: boolean;
        readonly position: number;
        size: number;
        getInputStreamAt(position: number): Windows.Storage.Streams.IInputStream;
        getOutputStreamAt(position: number): Windows.Storage.Streams.IOutputStream;
        seek(position: number): void;
        cloneStream(): Windows.Storage.Streams.IRandomAccessStream;
    }

    interface IRandomAccessStreamReference {
        openReadAsync(): any;
    }

    interface IRandomAccessStreamWithContentType extends Windows.Storage.Streams.IRandomAccessStream, any, Windows.Storage.Streams.IInputStream, Windows.Storage.Streams.IOutputStream, Windows.Storage.Streams.IContentTypeProvider {
    }

    class InMemoryRandomAccessStream implements Windows.Storage.Streams.IRandomAccessStream, Windows.Storage.Streams.IOutputStream, any, Windows.Storage.Streams.IInputStream {
        public size: number;
        public readonly canRead: boolean;
        public readonly canWrite: boolean;
        public readonly position: number;
        public constructor();
        public getInputStreamAt(position: number): Windows.Storage.Streams.IInputStream;
        public getOutputStreamAt(position: number): Windows.Storage.Streams.IOutputStream;
        public seek(position: number): void;
        public cloneStream(): Windows.Storage.Streams.IRandomAccessStream;
        public close(): void;
        public readAsync(buffer: Windows.Storage.Streams.IBuffer, count: number, options: Windows.Storage.Streams.InputStreamOptions): any;
        public writeAsync(buffer: Windows.Storage.Streams.IBuffer): any;
        public flushAsync(): any;
    }

    enum InputStreamOptions {
        none = 0,
        partial = 1,
        readAhead = 2,
    }

    class InputStreamOverStream implements Windows.Storage.Streams.IInputStream, any {
        public readAsync(buffer: Windows.Storage.Streams.IBuffer, count: number, options: Windows.Storage.Streams.InputStreamOptions): any;
        public close(): void;
    }

    class OutputStreamOverStream implements Windows.Storage.Streams.IOutputStream, any {
        public writeAsync(buffer: Windows.Storage.Streams.IBuffer): any;
        public flushAsync(): any;
        public close(): void;
    }

    abstract class RandomAccessStream {
        public static copyAsync(source: Windows.Storage.Streams.IInputStream, destination: Windows.Storage.Streams.IOutputStream): any;
        public static copyAsync(source: Windows.Storage.Streams.IInputStream, destination: Windows.Storage.Streams.IOutputStream, bytesToCopy: number): any;
        public static copyAndCloseAsync(source: Windows.Storage.Streams.IInputStream, destination: Windows.Storage.Streams.IOutputStream): any;
    }

    class RandomAccessStreamOverStream implements Windows.Storage.Streams.IRandomAccessStream, Windows.Storage.Streams.IOutputStream, any, Windows.Storage.Streams.IInputStream {
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

    class RandomAccessStreamReference implements Windows.Storage.Streams.IRandomAccessStreamReference {
        public openReadAsync(): any;
        public static createFromFile(file: Windows.Storage.IStorageFile): Windows.Storage.Streams.RandomAccessStreamReference;
        public static createFromUri(uri: any): Windows.Storage.Streams.RandomAccessStreamReference;
        public static createFromStream(stream: Windows.Storage.Streams.IRandomAccessStream): Windows.Storage.Streams.RandomAccessStreamReference;
    }

    enum UnicodeEncoding {
        utf8 = 0,
        utf16LE = 1,
        utf16BE = 2,
    }

}