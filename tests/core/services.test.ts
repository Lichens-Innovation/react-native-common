import { File } from 'expo-file-system';
import Zeroconf from 'react-native-zeroconf';
import { DeviceFinder, EncodingType, nativeFileSystem } from '@lib';
import { getMockLogger } from './core-test.utils';

jest.mock('react-native-zeroconf', () => {
  class MockZeroconf {
    static instances: MockZeroconf[] = [];
    handlers: Record<string, (arg?: unknown) => void> = {};
    scan = jest.fn();
    stop = jest.fn();
    removeDeviceListeners = jest.fn();
    constructor() {
      MockZeroconf.instances.push(this);
    }
    on(event: string, handler: (arg?: unknown) => void) {
      this.handlers[event] = handler;
    }
  }
  return { __esModule: true, default: MockZeroconf };
});

jest.mock('expo-file-system', () => {
  class MockFile {
    static instances: MockFile[] = [];
    static text = '';
    static bytesValue = new Uint8Array();
    uri: string;
    write = jest.fn();
    bytes = jest.fn(async () => MockFile.bytesValue);
    textSync = jest.fn(() => MockFile.text);
    constructor(uri: string) {
      this.uri = uri;
      MockFile.instances.push(this);
    }
  }
  return {
    File: MockFile,
    Directory: class {},
    Paths: { document: { uri: '/mock/document/' }, cache: { uri: '/mock/cache/' }, info: jest.fn() },
  };
});

interface MockZeroconfInstance {
  handlers: Record<string, (arg?: unknown) => void>;
  scan: jest.Mock;
  stop: jest.Mock;
  removeDeviceListeners: jest.Mock;
}

interface MockFileInstance {
  uri: string;
  write: jest.Mock;
  bytes: jest.Mock;
  textSync: jest.Mock;
}

const zeroconfInstances = () => (Zeroconf as unknown as { instances: MockZeroconfInstance[] }).instances;
const lastZeroconf = () => zeroconfInstances()[zeroconfInstances().length - 1];
const MockFileClass = File as unknown as { instances: MockFileInstance[]; text: string; bytesValue: Uint8Array };
const fileInstances = () => MockFileClass.instances;
const lastFile = () => fileInstances()[fileInstances().length - 1];

const mockLogger = getMockLogger();

describe('services', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('DeviceFinder', () => {
    const scanArgs = (overrides = {}) => ({
      type: 'http',
      protocol: 'tcp',
      domain: 'local.',
      onError: jest.fn(),
      onSuccess: jest.fn(),
      timeoutMs: 1000,
      ...overrides,
    });

    beforeEach(() => {
      jest.useFakeTimers();
    });

    afterEach(() => {
      jest.useRealTimers();
    });

    it('starts a zeroconf scan with type, protocol and domain', () => {
      // arrange
      const finder = new DeviceFinder();

      // act
      finder.scan(scanArgs());
      lastZeroconf().handlers.start();

      // assert
      expect(lastZeroconf().scan).toHaveBeenCalledWith('http', 'tcp', 'local.');
      expect(finder.isScanning).toBe(true);
    });

    it('reports a resolved device: stops scanning then calls onSuccess', () => {
      // arrange
      const finder = new DeviceFinder();
      const args = scanArgs();
      finder.scan(args);
      const zeroconf = lastZeroconf();

      // act
      zeroconf.handlers.resolved({ name: 'cam-1', host: 'h' });

      // assert
      expect(args.onSuccess).toHaveBeenCalledTimes(1);
      expect(args.onError).not.toHaveBeenCalled();
      expect(zeroconf.stop).toHaveBeenCalled();
      expect(zeroconf.removeDeviceListeners).toHaveBeenCalled();
      expect(finder.isScanning).toBe(false);
      // stop() resets the state before the device is pushed habit-hooks-disable non-essential-comment
      expect(finder.discoveredDevices).toEqual([{ name: 'cam-1', host: 'h' }]);
    });

    it('calls onError with an Error after the timeout', () => {
      // arrange
      const finder = new DeviceFinder();
      const args = scanArgs({ timeoutMs: 500 });
      finder.scan(args);

      // act
      jest.advanceTimersByTime(500);

      // assert
      expect(args.onError).toHaveBeenCalledWith(
        expect.objectContaining({ message: '[DeviceFinder] timed out after 500ms' })
      );
      expect(mockLogger.info).toHaveBeenCalledWith('[DeviceFinder] Failed to scan for cameras:', expect.any(Error));
    });

    it('converts a non-Error zeroconf failure to an Error', () => {
      // arrange
      const finder = new DeviceFinder();
      const args = scanArgs();
      finder.scan(args);

      // act
      lastZeroconf().handlers.error('raw failure' as never);

      // assert
      expect(args.onError).toHaveBeenCalledTimes(1);
      expect(args.onError.mock.calls[0][0]).toBeInstanceOf(Error);
    });

    it('does not fire the timeout once a device was resolved', () => {
      // arrange
      const finder = new DeviceFinder();
      const args = scanArgs({ timeoutMs: 500 });
      finder.scan(args);

      // act
      lastZeroconf().handlers.resolved({ name: 'cam-1' });
      jest.advanceTimersByTime(1000);

      // assert
      expect(args.onError).not.toHaveBeenCalled();
    });

    it('logs an error when stopping zeroconf throws but still resets', () => {
      // arrange
      const finder = new DeviceFinder();
      const args = scanArgs();
      finder.scan(args);
      const zeroconf = lastZeroconf();
      zeroconf.stop.mockImplementation(() => {
        throw new Error('stop failed');
      });

      // act
      zeroconf.handlers.resolved({ name: 'cam-1' });

      // assert
      expect(mockLogger.error).toHaveBeenCalledWith('[DeviceFinder] Error stopping scan:', expect.any(Error));
      expect(zeroconf.removeDeviceListeners).toHaveBeenCalled();
      expect(args.onSuccess).toHaveBeenCalled();
    });
  });

  describe('nativeFileSystem', () => {
    it('exposes document and cache directories', () => {
      expect(nativeFileSystem.documentDirectory).toBe('/mock/document/');
      expect(nativeFileSystem.cacheDirectory).toBe('/mock/cache/');
    });

    it.each`
      options                              | encoding
      ${undefined}                         | ${'utf8'}
      ${{ encoding: EncodingType.UTF8 }}   | ${'utf8'}
      ${{ encoding: EncodingType.Base64 }} | ${'base64'}
    `('writeAsStringAsync writes with $encoding for $options', async ({ options, encoding }) => {
      // act
      await nativeFileSystem.writeAsStringAsync('/f.txt', 'content', options);

      // assert
      expect(lastFile().uri).toBe('/f.txt');
      expect(lastFile().write).toHaveBeenCalledWith('content', { encoding });
    });

    it('readAsStringAsync reads text by default', async () => {
      // arrange
      MockFileClass.text = 'hello';

      // act
      const result = await nativeFileSystem.readAsStringAsync('/f.txt');

      // assert
      expect(result).toBe('hello');
      expect(lastFile().uri).toBe('/f.txt');
    });

    it('readAsBase64Async encodes the bytes in base64', async () => {
      // arrange
      MockFileClass.bytesValue = new Uint8Array([104, 105]);

      // act
      const result = await nativeFileSystem.readAsBase64Async('/f.bin');

      // assert
      expect(result).toBe('aGk=');
      expect(lastFile().bytes).toHaveBeenCalled();
      expect(lastFile().textSync).not.toHaveBeenCalled();
    });
  });
});
