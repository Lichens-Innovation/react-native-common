jest.mock('expo-file-system', () => ({
  Directory: class {},
  File: class {},
  Paths: {
    document: { uri: '/mock/document' },
    cache: { uri: '/mock/cache' },
  },
}));

jest.mock('expo-file-system/legacy', () => ({}));

jest.mock('expo-constants', () => ({
  __esModule: true,
  default: {
    appOwnership: 'standalone',
    executionEnvironment: 'standalone',
    expoConfig: {
      ios: { bundleIdentifier: 'com.test.app' },
      android: { package: 'com.test.app' },
    },
  },
}));

jest.mock('expo-device', () => ({
  brand: 'mock',
  modelName: 'mock',
  osName: 'mock',
  osVersion: '1.0.0',
}));

jest.mock('expo-updates', () => ({
  isEnabled: false,
  isEmbeddedLaunch: false,
  channel: null,
}));

jest.mock('react-native-mmkv', () => ({
  MMKV: jest.fn().mockImplementation(() => ({
    set: jest.fn(),
    getString: jest.fn(),
    getNumber: jest.fn(),
    getBoolean: jest.fn(),
    getBuffer: jest.fn(),
    delete: jest.fn(),
    clearAll: jest.fn(),
    contains: jest.fn(),
    getAllKeys: jest.fn(() => []),
  })),
}));

jest.mock('react-native-logs', () => {
  const mockLogger = { debug: jest.fn(), info: jest.fn(), warn: jest.fn(), error: jest.fn() };
  return {
    fileAsyncTransport: jest.fn(),
    mapConsoleTransport: jest.fn(),
    logger: { createLogger: jest.fn(() => mockLogger) },
    sentryTransport: jest.fn(),
    transportFunctionType: {},
  };
});

jest.mock('@sentry/react-native', () => ({
  captureException: jest.fn(),
  captureMessage: jest.fn(),
}));

require('react-native-gesture-handler/jestSetup');
jest.mock('react-native-worklets', () => require('react-native-worklets/lib/module/mock'));
jest.mock('react-native-reanimated', () => require('react-native-reanimated/mock'));

jest.mock('@react-native-clipboard/clipboard', () => require('@react-native-clipboard/clipboard/jest/clipboard-mock'));
jest.mock('@react-native-community/netinfo', () => require('@react-native-community/netinfo/jest/netinfo-mock'));

jest.mock('react-native-maps', () => {
  const { View } = require('react-native');
  const MockMapView = (props: object) => require('react').createElement(View, props);
  return { __esModule: true, default: MockMapView, Marker: MockMapView, PROVIDER_GOOGLE: 'google' };
});

const mockEveryExportAsJestFn = () =>
  new Proxy<Record<string | symbol, unknown>>(
    { __esModule: true },
    { get: (target, key) => (key in target ? target[key] : (target[key] = jest.fn())) }
  );

jest.mock('expo-audio', () => mockEveryExportAsJestFn());
jest.mock('expo-camera', () => mockEveryExportAsJestFn());
jest.mock('expo-speech-recognition', () => mockEveryExportAsJestFn());
jest.mock('expo-video', () => mockEveryExportAsJestFn());
jest.mock('expo-video-thumbnails', () => mockEveryExportAsJestFn());
jest.mock('expo-image-picker', () => mockEveryExportAsJestFn());
jest.mock('expo-image-manipulator', () => mockEveryExportAsJestFn());
jest.mock('expo-media-library', () => mockEveryExportAsJestFn());
jest.mock('expo-location', () => mockEveryExportAsJestFn());
jest.mock('expo-sharing', () => mockEveryExportAsJestFn());
jest.mock('expo-document-picker', () => mockEveryExportAsJestFn());
jest.mock('expo-sqlite', () => mockEveryExportAsJestFn());
jest.mock('expo-screen-orientation', () => mockEveryExportAsJestFn());
jest.mock('react-native-wifi-reborn', () => mockEveryExportAsJestFn());
jest.mock('react-native-zeroconf', () => mockEveryExportAsJestFn());
jest.mock('react-native-volume-manager', () => mockEveryExportAsJestFn());
jest.mock('react-native-webview', () => mockEveryExportAsJestFn());
