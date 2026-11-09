import Clipboard from '@react-native-clipboard/clipboard';
import { act, fireEvent, renderHook, screen } from '@testing-library/react-native';
import { format } from 'date-fns';
import * as Sharing from 'expo-sharing';
import type { ForwardedRef, ReactNode } from 'react';
import {
  commonLogsStore,
  EventLogsScreen,
  formatLogMessage,
  LogEntryItem,
  LogsViewer,
  useAutoScroll,
  useLogsActions,
  type LogEntry,
} from '@lib';
import { renderWithProviders, TestProviders } from './render-with-providers';

interface MockLogFileEntry {
  name: string;
  size: number;
  modificationTime: number;
  deleteError?: Error;
}

interface MockFileSystem {
  exists: boolean;
  files: MockLogFileEntry[];
  deleted: string[];
}

interface FakeLegendListRenderItemInfo {
  item: unknown;
  index: number;
}

interface FakeLegendListProps {
  data: unknown[];
  keyExtractor?: (item: unknown, index: number) => string;
  renderItem: (info: FakeLegendListRenderItemInfo) => ReactNode;
}

// in-memory document directory backing expo-file-system (the logger lists / deletes log files through it) habit-hooks-disable non-essential-comment
const mockFileSystem: MockFileSystem = {
  exists: true,
  files: [],
  deleted: [],
};

jest.mock('expo-file-system', () => {
  class File {
    name: string;
    entry: MockLogFileEntry;
    constructor(fileName: string, fileEntry: MockLogFileEntry) {
      this.name = fileName;
      this.entry = fileEntry;
    }
    get uri() {
      return `file:///mock/document/${this.name}`;
    }
    info() {
      return { exists: true, size: this.entry.size, modificationTime: this.entry.modificationTime };
    }
    delete() {
      if (this.entry.deleteError) throw this.entry.deleteError;
      mockFileSystem.deleted.push(this.name);
    }
  }
  class Directory {
    list() {
      return mockFileSystem.files.map((entry) => new File(entry.name, entry));
    }
  }
  return {
    File,
    Directory,
    Paths: {
      document: { uri: '/mock/document' },
      cache: { uri: '/mock/cache' },
      info: () => ({ exists: mockFileSystem.exists }),
    },
  };
});

// LegendList needs real layout to render rows; this fake renders every row and exposes scrollToIndex habit-hooks-disable non-essential-comment
const mockScrollToIndex = jest.fn();
jest.mock('@legendapp/list', () => {
  const React = jest.requireActual<typeof import('react')>('react');
  const { View } = jest.requireActual<typeof import('react-native')>('react-native');
  const LegendList = React.forwardRef((props: FakeLegendListProps, ref: ForwardedRef<unknown>) => {
    React.useImperativeHandle(ref, () => ({ scrollToIndex: mockScrollToIndex }));
    return (
      <View accessibilityLabel="legend-list">
        {props.data.map((item: unknown, index: number) => (
          <View key={props.keyExtractor ? props.keyExtractor(item, index) : index}>
            {props.renderItem({ item, index })}
          </View>
        ))}
      </View>
    );
  });
  return { LegendList };
});

const LOG_PREFIX = 'app-logs-app';

const logEntry = (msg: string, severity = 2): LogEntry => ({
  msg,
  rawMsg: undefined,
  level: { severity, text: 'info' },
});

beforeEach(() => {
  jest.clearAllMocks();
  mockFileSystem.exists = true;
  mockFileSystem.files = [];
  mockFileSystem.deleted = [];
  commonLogsStore.clearLogs();
});

describe('formatLogMessage', () => {
  it.each`
    msg                                      | expected
    ${'2024-01-02T10:11:12.123Z INFO hello'} | ${'10:11:12.123Z INFO hello'}
    ${'2024-01-02T'}                         | ${''}
    ${'short'}                               | ${''}
    ${''}                                    | ${''}
    ${'12345678901X'}                        | ${'X'}
  `('returns "$expected" for "$msg"', ({ msg, expected }) => {
    expect(formatLogMessage(msg)).toBe(expected);
  });
});

describe('LogEntryItem', () => {
  beforeEach(() => jest.useFakeTimers());
  afterEach(() => jest.useRealTimers());

  it('renders the message without its date prefix', async () => {
    // act
    await renderWithProviders(<LogEntryItem logEntry={logEntry('2024-01-02T10:11:12 hello world')} />);

    // assert
    expect(screen.getByText('10:11:12 hello world')).toBeOnTheScreen();
  });

  it('copies the full message on long press and shows a snackbar', async () => {
    // arrange
    await renderWithProviders(<LogEntryItem logEntry={logEntry('2024-01-02T10:11:12 hello world')} />);

    // act
    await fireEvent(screen.getByText('10:11:12 hello world'), 'longPress');
    await act(async () => {
      jest.runOnlyPendingTimers();
    });

    // assert
    expect(Clipboard.setString).toHaveBeenCalledWith('2024-01-02T10:11:12 hello world');
    expect(screen.getByText('common:copiedToClipboard')).toBeOnTheScreen();
  });
});

describe('useAutoScroll', () => {
  const ITEMS = ['a', 'b', 'c'];

  it.each`
    shouldAutoScroll | expected
    ${undefined}     | ${false}
    ${false}         | ${false}
    ${true}          | ${true}
  `(
    'starts with isAutoScrollEnabled=$expected for shouldAutoScroll=$shouldAutoScroll',
    async ({ shouldAutoScroll, expected }) => {
      // act
      const { result } = await renderHook(() => useAutoScroll<string>(shouldAutoScroll));

      // assert
      expect(result.current.isAutoScrollEnabled).toBe(expected);
    }
  );

  it('scrolls to the last item when enabled and a list is attached', async () => {
    // arrange
    const scrollToIndex = jest.fn();
    const { result } = await renderHook(() => useAutoScroll<string>(true));
    (result.current.listRef as { current: unknown }).current = { scrollToIndex };

    // act
    result.current.scrollToBottom(ITEMS);

    // assert
    expect(scrollToIndex).toHaveBeenCalledWith({ index: 2, animated: false, viewPosition: 1 });
  });

  it.each`
    enabled  | hasList  | items    | description
    ${false} | ${true}  | ${ITEMS} | ${'disabled'}
    ${true}  | ${false} | ${ITEMS} | ${'no list attached'}
    ${true}  | ${true}  | ${[]}    | ${'empty items'}
  `('does not scroll when $description', async ({ enabled, hasList, items }) => {
    // arrange
    const scrollToIndex = jest.fn();
    const { result } = await renderHook(() => useAutoScroll<string>(enabled));
    if (hasList) (result.current.listRef as { current: unknown }).current = { scrollToIndex };

    // act
    result.current.scrollToBottom(items);

    // assert
    expect(scrollToIndex).not.toHaveBeenCalled();
  });

  it('toggles auto scroll', async () => {
    // arrange
    const { result } = await renderHook(() => useAutoScroll<string>());

    // act
    await act(async () => result.current.toggleAutoScroll());

    // assert
    expect(result.current.isAutoScrollEnabled).toBe(true);
  });
});

describe('useLogsActions', () => {
  const wrapper = TestProviders;

  beforeEach(() => jest.useFakeTimers());
  afterEach(() => jest.useRealTimers());

  it('filters the store logs case-insensitively after a 300ms debounce', async () => {
    // arrange
    commonLogsStore.addLog(logEntry('Alpha'));
    commonLogsStore.addLog(logEntry('beta'));
    const { result } = await renderHook(() => useLogsActions(), { wrapper });

    // act
    await act(async () => result.current.setFilterText('ALP'));
    const beforeDebounce = result.current.filteredLogs.map(({ msg }) => msg);
    await act(async () => {
      jest.advanceTimersByTime(300);
    });

    // assert
    expect(result.current.filterText).toBe('ALP');
    expect(beforeDebounce).toEqual(['Alpha', 'beta']);
    expect(result.current.filteredLogs.map(({ msg }) => msg)).toEqual(['Alpha']);
  });

  it('treats a whitespace filter literally (no trimming)', async () => {
    // arrange
    commonLogsStore.addLog(logEntry('no-space'));
    commonLogsStore.addLog(logEntry('with space'));
    const { result } = await renderHook(() => useLogsActions(), { wrapper });

    // act
    await act(async () => result.current.setFilterText(' '));
    await act(async () => {
      jest.advanceTimersByTime(300);
    });

    // assert
    expect(result.current.filteredLogs.map(({ msg }) => msg)).toEqual(['with space']);
  });

  it('copies all logs joined by new lines', async () => {
    // arrange
    commonLogsStore.addLog(logEntry('first'));
    commonLogsStore.addLog(logEntry(''));
    commonLogsStore.addLog(logEntry('second'));
    const { result } = await renderHook(() => useLogsActions(), { wrapper });

    // act
    await act(async () => result.current.handleCopyAllLogs());

    // assert
    expect(Clipboard.setString).toHaveBeenCalledWith('first\nsecond');
  });
});

describe('LogsViewer', () => {
  beforeEach(() => jest.useFakeTimers());
  afterEach(() => jest.useRealTimers());

  const addLogs = (...messages: string[]) => messages.forEach((msg) => commonLogsStore.addLog(logEntry(msg)));

  it('renders the toolbar and every log by default', async () => {
    // arrange
    addLogs('2024-01-01T00:00:01 one', '2024-01-01T00:00:02 two');

    // act
    await renderWithProviders(<LogsViewer />);

    // assert
    expect(screen.getByPlaceholderText('common:logs.filter')).toBeOnTheScreen();
    expect(screen.getByLabelText('common:toggleAutoScroll')).toBeOnTheScreen();
    expect(screen.getByLabelText('common:logs.clear')).toBeOnTheScreen();
    expect(screen.getByLabelText('common:logs.copyAll')).toBeOnTheScreen();
    expect(screen.getByText('00:00:01 one')).toBeOnTheScreen();
    expect(screen.getByText('00:00:02 two')).toBeOnTheScreen();
  });

  it('hides the toolbar when shouldDisplayToolbar is false', async () => {
    // act
    await renderWithProviders(<LogsViewer shouldDisplayToolbar={false} />);

    // assert
    expect(screen.queryByPlaceholderText('common:logs.filter')).toBeNull();
    expect(screen.queryByLabelText('common:logs.copyAll')).toBeNull();
  });

  it('filters logs from the toolbar input after the debounce', async () => {
    // arrange
    addLogs('2024-01-01T00:00:01 apple', '2024-01-01T00:00:02 banana');
    await renderWithProviders(<LogsViewer />);

    // act
    await fireEvent.changeText(screen.getByPlaceholderText('common:logs.filter'), 'banana');
    await act(async () => {
      jest.advanceTimersByTime(300);
    });

    // assert
    expect(screen.queryByText('00:00:01 apple')).toBeNull();
    expect(screen.getByText('00:00:02 banana')).toBeOnTheScreen();
  });

  it('clears the store from the delete button (observer re-renders)', async () => {
    // arrange
    addLogs('2024-01-01T00:00:01 apple');
    await renderWithProviders(<LogsViewer />);

    // act
    await fireEvent.press(screen.getByLabelText('common:logs.clear'));

    // assert
    expect(screen.queryByText('00:00:01 apple')).toBeNull();
  });

  it('copies all logs from the copy button and shows a snackbar', async () => {
    // arrange
    addLogs('one', 'two');
    await renderWithProviders(<LogsViewer />);

    // act
    await fireEvent.press(screen.getByLabelText('common:logs.copyAll'));
    await act(async () => {
      jest.runOnlyPendingTimers();
    });

    // assert
    expect(Clipboard.setString).toHaveBeenCalledWith('one\ntwo');
    expect(screen.getByText('common:copiedToClipboard')).toBeOnTheScreen();
  });

  it('scrolls to the last log on mount when shouldAutoScroll is true', async () => {
    // arrange
    addLogs('one', 'two', 'three');

    // act
    await renderWithProviders(<LogsViewer shouldAutoScroll />);

    // assert
    expect(mockScrollToIndex).toHaveBeenLastCalledWith({ index: 2, animated: false, viewPosition: 1 });
  });

  it('does not scroll by default', async () => {
    // arrange
    addLogs('one', 'two');

    // act
    await renderWithProviders(<LogsViewer />);

    // assert
    expect(mockScrollToIndex).not.toHaveBeenCalled();
  });

  it('starts scrolling after toggling auto scroll on and receiving a new log', async () => {
    // arrange
    addLogs('one');
    await renderWithProviders(<LogsViewer />);
    await fireEvent.press(screen.getByLabelText('common:toggleAutoScroll'));

    // act
    await act(async () => addLogs('two'));

    // assert
    expect(mockScrollToIndex).toHaveBeenLastCalledWith({ index: 1, animated: false, viewPosition: 1 });
  });
});

describe('EventLogsScreen', () => {
  const MODIFIED_AT = new Date(2024, 0, 2, 3, 4, 5).getTime();

  const flushPromises = () =>
    act(async () => {
      await new Promise<void>((resolve) => setImmediate(() => resolve()));
    });

  it('lists log files (most recent first) with their date and size', async () => {
    // arrange
    mockFileSystem.files = [
      { name: `${LOG_PREFIX}-old.txt`, size: 10, modificationTime: MODIFIED_AT - 1000 },
      { name: 'not-a-log.txt', size: 1, modificationTime: MODIFIED_AT },
      { name: `${LOG_PREFIX}-new.txt`, size: 2048, modificationTime: MODIFIED_AT },
    ];

    // act
    await renderWithProviders(<EventLogsScreen />);
    await flushPromises();

    // assert
    expect(screen.getByText('common:eventLogs')).toBeOnTheScreen();
    const titles = screen.getAllByText(new RegExp(`^${LOG_PREFIX}`)).map((node) => node.props.children);
    expect(titles).toEqual([`${LOG_PREFIX}-new.txt`, `${LOG_PREFIX}-old.txt`]);
    expect(screen.queryByText('not-a-log.txt')).toBeNull();
    expect(screen.getByText(`${format(MODIFIED_AT, 'yyyy-MM-dd HH:mm:ss')} [ 2.05 kB ]`)).toBeOnTheScreen();
    expect(screen.getByText(`${format(MODIFIED_AT - 1000, 'yyyy-MM-dd HH:mm:ss')} [ 10 B ]`)).toBeOnTheScreen();
  });

  it('renders an empty list when the logs directory does not exist', async () => {
    // arrange
    mockFileSystem.exists = false;

    // act
    await renderWithProviders(<EventLogsScreen />);
    await flushPromises();

    // assert
    expect(screen.getByLabelText('legend-list').children).toHaveLength(0);
  });

  it('shares a log file as plain text from its share button', async () => {
    // arrange
    jest.mocked(Sharing.isAvailableAsync).mockResolvedValue(true);
    mockFileSystem.files = [{ name: `${LOG_PREFIX}-a.txt`, size: 1, modificationTime: MODIFIED_AT }];
    await renderWithProviders(<EventLogsScreen />);
    await flushPromises();

    // act
    await fireEvent.press(screen.getAllByRole('button')[0]);
    await flushPromises();

    // assert
    expect(Sharing.shareAsync).toHaveBeenCalledWith(
      `file:///mock/document/${LOG_PREFIX}-a.txt`,
      expect.objectContaining({ mimeType: expect.stringMatching(/plain/) })
    );
  });

  it('asks for confirmation then deletes every log file and empties the list', async () => {
    // arrange
    mockFileSystem.files = [
      { name: `${LOG_PREFIX}-a.txt`, size: 1, modificationTime: MODIFIED_AT },
      { name: `${LOG_PREFIX}-b.txt`, size: 1, modificationTime: MODIFIED_AT },
    ];
    await renderWithProviders(<EventLogsScreen />);
    await flushPromises();

    // act
    await fireEvent.press(screen.getByText('common:delete'));
    const isDialogShown = screen.queryByText('common:deleteAllLogsFilesConfirmation') !== null;
    await fireEvent.press(screen.getByText('common:ok'));
    await flushPromises();

    // assert
    expect(isDialogShown).toBe(true);
    expect(mockFileSystem.deleted).toEqual([`${LOG_PREFIX}-a.txt`, `${LOG_PREFIX}-b.txt`]);
    expect(screen.queryByText(`${LOG_PREFIX}-a.txt`)).toBeNull();
    expect(screen.queryByText('common:deleteAllLogsFilesConfirmation')).toBeNull();
  });

  it('closes the confirmation without deleting on cancel', async () => {
    // arrange
    mockFileSystem.files = [{ name: `${LOG_PREFIX}-a.txt`, size: 1, modificationTime: MODIFIED_AT }];
    await renderWithProviders(<EventLogsScreen />);
    await flushPromises();

    // act
    await fireEvent.press(screen.getByText('common:delete'));
    await fireEvent.press(screen.getByText('common:cancel'));

    // assert
    expect(mockFileSystem.deleted).toEqual([]);
    expect(screen.getByText(`${LOG_PREFIX}-a.txt`)).toBeOnTheScreen();
    expect(screen.queryByText('common:deleteAllLogsFilesConfirmation')).toBeNull();
  });
});
