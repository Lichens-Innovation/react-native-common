import { MMKV } from 'react-native-mmkv';
import * as RNLogs from 'react-native-logs';

interface MockLogger {
  debug: jest.Mock;
  info: jest.Mock;
  warn: jest.Mock;
  error: jest.Mock;
}

// the react-native-logs mock (jest.setup.ts) hands out the same logger object on every createLogger call habit-hooks-disable non-essential-comment
export const getMockLogger = (): MockLogger => (RNLogs.logger.createLogger as unknown as () => MockLogger)();

interface MockMmkv {
  set: jest.Mock;
  getString: jest.Mock;
  getNumber: jest.Mock;
  getBoolean: jest.Mock;
  getBuffer: jest.Mock;
  delete: jest.Mock;
}

// the single MMKV instance created by the storage module when '@lib' is imported habit-hooks-disable non-essential-comment
export const getMockMmkv = (): MockMmkv => jest.mocked(MMKV).mock.results[0]?.value as MockMmkv;
