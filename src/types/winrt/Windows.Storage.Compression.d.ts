//tslint:disable

declare namespace Windows.Storage.Compression {
    enum CompressAlgorithm {
        invalidAlgorithm = 0,
        nullAlgorithm = 1,
        mszip = 2,
        xpress = 3,
        xpressHuff = 4,
        lzms = 5,
    }

    class Compressor implements Windows.Storage.Streams.IOutputStream, any {
        public constructor(underlyingStream: Windows.Storage.Streams.IOutputStream);
        public constructor(underlyingStream: Windows.Storage.Streams.IOutputStream, algorithm: Windows.Storage.Compression.CompressAlgorithm, blockSize: number);
        public finishAsync(): any;
        public detachStream(): Windows.Storage.Streams.IOutputStream;
        public writeAsync(buffer: Windows.Storage.Streams.IBuffer): any;
        public flushAsync(): any;
        public close(): void;
    }

    class Decompressor implements Windows.Storage.Streams.IInputStream, any {
        public constructor(underlyingStream: Windows.Storage.Streams.IInputStream);
        public detachStream(): Windows.Storage.Streams.IInputStream;
        public readAsync(buffer: Windows.Storage.Streams.IBuffer, count: number, options: Windows.Storage.Streams.InputStreamOptions): any;
        public close(): void;
    }

}