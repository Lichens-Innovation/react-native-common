import { AppState } from 'react-native';
import { commonLogsStore, commonLogsStoreTransport, commonStore } from '@lib';
import { getMockLogger } from './core-test.utils';

const mockLogger = getMockLogger();
const level = { text: 'INFO', severity: 2 };

describe('commonLogsStore', () => {
  beforeEach(() => {
    commonLogsStore.clearLogs();
  });

  it('starts empty', () => {
    expect(commonLogsStore.logEntries).toEqual([]);
    expect(commonLogsStore.allLogsAsText).toBe('');
  });

  it('keeps entries in insertion order', () => {
    // act
    commonLogsStore.addLog({ msg: 'one', rawMsg: undefined, level });
    commonLogsStore.addLog({ msg: 'two', rawMsg: undefined, level });

    // assert
    expect(commonLogsStore.logEntries.map(({ msg }) => msg)).toEqual(['one', 'two']);
    expect(commonLogsStore.allLogsAsText).toBe('one\ntwo');
  });

  it('drops empty messages from allLogsAsText', () => {
    // act
    commonLogsStore.addLog({ msg: 'one', rawMsg: undefined, level });
    commonLogsStore.addLog({ msg: '', rawMsg: undefined, level });
    commonLogsStore.addLog({ msg: 'two', rawMsg: undefined, level });

    // assert
    expect(commonLogsStore.allLogsAsText).toBe('one\ntwo');
  });

  it('keeps whitespace-only messages in allLogsAsText', () => {
    // act
    commonLogsStore.addLog({ msg: 'one', rawMsg: undefined, level });
    commonLogsStore.addLog({ msg: '   ', rawMsg: undefined, level });
    commonLogsStore.addLog({ msg: 'two', rawMsg: undefined, level });

    // assert
    expect(commonLogsStore.allLogsAsText).toBe('one\n   \ntwo');
  });

  it('is bounded to 2000 entries, dropping the oldest first', () => {
    // act
    for (let i = 0; i < 2005; i++) {
      commonLogsStore.addLog({ msg: `m${i}`, rawMsg: undefined, level });
    }

    // assert
    const entries = commonLogsStore.logEntries;
    expect(entries).toHaveLength(2000);
    expect(entries[0].msg).toBe('m5');
    expect(entries[1999].msg).toBe('m2004');
  });

  it('filters case-insensitively on msg', () => {
    // arrange
    commonLogsStore.addLog({ msg: 'Hello World', rawMsg: undefined, level });
    commonLogsStore.addLog({ msg: 'other', rawMsg: undefined, level });

    // act
    const filtered = commonLogsStore.filterLogs('WORLD');

    // assert
    expect(filtered.map(({ msg }) => msg)).toEqual(['Hello World']);
    expect(commonLogsStore.filterLogs('')).toHaveLength(2);
  });

  it('clearLogs empties the store', () => {
    // arrange
    commonLogsStore.addLog({ msg: 'one', rawMsg: undefined, level });

    // act
    commonLogsStore.clearLogs();

    // assert
    expect(commonLogsStore.logEntries).toEqual([]);
  });

  describe('commonLogsStoreTransport', () => {
    it('stores msg and level but strips rawMsg', () => {
      // act
      commonLogsStoreTransport({ msg: 'formatted', rawMsg: { heavy: true }, level } as never);

      // assert
      expect(commonLogsStore.logEntries).toEqual([{ msg: 'formatted', level, rawMsg: undefined }]);
    });
  });
});

describe('commonStore', () => {
  it('defaults to dark mode and toggles / sets it', () => {
    // arrange
    commonStore.setIsDarkMode(true);

    // act
    commonStore.toggleDarkMode();
    const afterToggle = commonStore.isDarkMode;
    commonStore.setIsDarkMode(true);

    // assert
    expect(afterToggle).toBe(false);
    expect(commonStore.isDarkMode).toBe(true);
  });

  it('tracks app state changes and ignores repeated states', () => {
    // arrange
    const listener = jest.mocked(AppState.addEventListener).mock.calls.find(([type]) => type === 'change')?.[1] as (
      state: string
    ) => void;
    mockLogger.info.mockClear();

    // act
    listener('background');
    listener('background');
    listener('active');

    // assert
    expect(commonStore.appStatus).toBe('active');
    expect(mockLogger.info).toHaveBeenCalledWith('[CommonStore] App state changed to background');
    expect(mockLogger.info).toHaveBeenCalledWith('[CommonStore] App state changed to active');
    expect(mockLogger.info).toHaveBeenCalledTimes(2);
  });
});
