import { vi } from 'vitest';

// Setup file for Vitest tests
// Define global variables used by React Native
(globalThis as any).__DEV__ = false;

// Mock React Native modules
vi.mock('react-native', () => ({
  InteractionManager: {
    runAfterInteractions: vi.fn((callback) => Promise.resolve(callback())),
  },
  LogBox: {
    ignoreLogs: vi.fn(),
  },
  Platform: {
    select: vi.fn((obj) => obj.ios || obj.android || obj.default),
    OS: 'ios',
  },
}));

// Mock expo-file-system
vi.mock('expo-file-system', () => ({
  Directory: {},
  File: class {},
  Paths: {
    document: { uri: '/mock/document' },
    cache: { uri: '/mock/cache' },
  },
}));

// Mock expo-file-system/legacy
vi.mock('expo-file-system/legacy', () => ({}));

// Mock expo-constants
vi.mock('expo-constants', () => ({
  default: {
    appOwnership: 'standalone',
    executionEnvironment: 'standalone',
    expoConfig: {
      ios: { bundleIdentifier: 'com.test.app' },
      android: { package: 'com.test.app' },
    },
  },
}));

// Mock expo-device
vi.mock('expo-device', () => ({
  brand: 'mock',
  modelName: 'mock',
  osName: 'mock',
  osVersion: '1.0.0',
}));

// Mock expo-updates
vi.mock('expo-updates', () => ({
  isEnabled: false,
  isEmbeddedLaunch: false,
  channel: null,
}));

// Mock react-native-mmkv
vi.mock('react-native-mmkv', () => ({
  MMKV: vi.fn().mockImplementation(() => ({
    set: vi.fn(),
    getString: vi.fn(),
    getNumber: vi.fn(),
    getBoolean: vi.fn(),
    getBuffer: vi.fn(),
    delete: vi.fn(),
    clearAll: vi.fn(),
    contains: vi.fn(),
    getAllKeys: vi.fn(() => []),
  })),
}));

// Mock react-native-logs
vi.mock('react-native-logs', () => {
  const mockLogger = {
    debug: vi.fn(),
    info: vi.fn(),
    warn: vi.fn(),
    error: vi.fn(),
  };
  return {
    fileAsyncTransport: vi.fn(),
    mapConsoleTransport: vi.fn(),
    logger: {
      createLogger: vi.fn(() => mockLogger),
    },
    sentryTransport: vi.fn(),
    transportFunctionType: {},
  };
});

// Mock @sentry/react-native
vi.mock('@sentry/react-native', () => ({
  captureException: vi.fn(),
  captureMessage: vi.fn(),
}));
