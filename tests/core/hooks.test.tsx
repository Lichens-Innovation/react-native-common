import { QueryClient, QueryClientProvider, QueryKey } from '@tanstack/react-query';
import { act, renderHook } from '@testing-library/react-native';
import * as ImagePicker from 'expo-image-picker';
import * as Updates from 'expo-updates';
import { PropsWithChildren } from 'react';
import { Image } from 'react-native';
import {
  SnackbarContext,
  requestMediaLibPermissions,
  requestTakePhotoPermissions,
  toSinglePictureUri,
  useCameraImagePicker,
  useImagePicker,
  useInvalidateQueriesOnFocus,
  useTimeoutState,
  useUpdates,
} from '@lib';
import { getMockLogger } from './core-test.utils';

let mockUpdatesChannel: string | null = null;

jest.mock('expo-updates', () => ({
  isEnabled: false,
  isEmbeddedLaunch: false,
  get channel() {
    return mockUpdatesChannel;
  },
  useUpdates: jest.fn(),
  fetchUpdateAsync: jest.fn(),
  checkForUpdateAsync: jest.fn(),
  reloadAsync: jest.fn(),
}));

jest.mock('expo-application', () => ({ nativeApplicationVersion: '1.2.3', nativeBuildVersion: '45' }));

let mockIsDevice = true;

jest.mock('expo-device', () => ({
  get isDevice() {
    return mockIsDevice;
  },
  brand: 'mock',
  modelName: 'mock',
  osName: 'mock',
  osVersion: '1',
}));

// the latest focus callback, so a test can replay a re-focus of the screen habit-hooks-disable non-essential-comment
let mockLastFocusEffect: (() => void) | undefined;

jest.mock('expo-router/react-navigation', () => {
  const { useEffect } = jest.requireActual<typeof import('react')>('react');
  return {
    ...jest.requireActual<object>('expo-router/react-navigation'),
    useFocusEffect: (effect: () => void) => {
      mockLastFocusEffect = effect;
      useEffect(effect, [effect]);
    },
  };
});

const mockLogger = getMockLogger();

interface InvalidateQueriesProps {
  keys: QueryKey[];
}

interface TimeoutStateProps {
  timeoutMs: number;
}

interface UpdatesState {
  isEmbeddedLaunch?: boolean;
  isUpdatePending?: boolean;
  isUpdateAvailable?: boolean;
}

const setUpdatesState = (state: UpdatesState) => {
  jest.mocked(Updates.useUpdates).mockReturnValue({
    currentlyRunning: { isEmbeddedLaunch: state.isEmbeddedLaunch ?? true },
    isUpdateAvailable: state.isUpdateAvailable ?? false,
    isUpdatePending: state.isUpdatePending ?? false,
  } as never);
};

const flushPromises = () => new Promise<void>((resolve) => setImmediate(() => resolve()));

describe('hooks', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('useUpdates', () => {
    beforeEach(() => {
      setUpdatesState({});
    });

    it.each`
      isEmbeddedLaunch | expected
      ${true}          | ${'Store version: 1.2.3 (45): from built-in code (no OTA update yet).'}
      ${false}         | ${'Store version: 1.2.3 (45): including OTA update.'}
    `('builds runTypeMessage for isEmbeddedLaunch=$isEmbeddedLaunch', async ({ isEmbeddedLaunch, expected }) => {
      // arrange
      setUpdatesState({ isEmbeddedLaunch, isUpdateAvailable: true });

      // act
      const { result } = await renderHook(() => useUpdates());

      // assert
      expect(result.current.runTypeMessage).toBe(expected);
      expect(result.current.isUpdateAvailable).toBe(true);
      expect(result.current.isUpdatePending).toBe(false);
      expect(result.current.isLoading).toBe(false);
    });

    it('fetchAndApplyUpdate toggles isLoading and logs success', async () => {
      // arrange
      let resolveFetch: () => void = () => {};
      jest.mocked(Updates.fetchUpdateAsync).mockReturnValue(
        new Promise((resolve) => {
          resolveFetch = () => resolve({} as never);
        })
      );
      const { result } = await renderHook(() => useUpdates());

      // act
      let pending: Promise<void> = Promise.resolve();
      await act(async () => {
        pending = result.current.fetchAndApplyUpdate();
      });
      const loadingDuringFetch = result.current.isLoading;
      await act(async () => {
        resolveFetch();
        await pending;
      });

      // assert
      expect(loadingDuringFetch).toBe(true);
      expect(result.current.isLoading).toBe(false);
      expect(mockLogger.info).toHaveBeenCalledWith('[useUpdates.fetchAndApplyUpdate] Update fetched successfully');
    });

    it('fetchAndApplyUpdate logs a warning (not an error) on failure and resolves', async () => {
      // arrange
      const failure = new Error('offline');
      jest.mocked(Updates.fetchUpdateAsync).mockRejectedValue(failure);
      const { result } = await renderHook(() => useUpdates());

      // act
      await act(async () => {
        await result.current.fetchAndApplyUpdate();
      });

      // assert
      expect(result.current.isLoading).toBe(false);
      expect(mockLogger.warn).toHaveBeenCalledWith('[useUpdates.fetchAndApplyUpdate] Failed to fetch update:', failure);
      expect(mockLogger.error).not.toHaveBeenCalled();
    });

    it('checkForUpdates fakes the check in development (sleeps 1s, no native call)', async () => {
      // arrange
      jest.useFakeTimers();
      const { result } = await renderHook(() => useUpdates());

      try {
        // act
        let pending: Promise<void> = Promise.resolve();
        await act(async () => {
          pending = result.current.checkForUpdates();
        });
        const loadingDuringCheck = result.current.isLoading;
        await act(async () => {
          await jest.advanceTimersByTimeAsync(1000);
          await pending;
        });

        // assert
        expect(loadingDuringCheck).toBe(true);
        expect(result.current.isLoading).toBe(false);
        expect(Updates.checkForUpdateAsync).not.toHaveBeenCalled();
        expect(mockLogger.info).toHaveBeenCalledWith('[checkForUpdateAsync] Faking update check on iOS Device');
        expect(mockLogger.info).toHaveBeenCalledWith('[useUpdates.checkForUpdates] Updates checked successfully');
      } finally {
        jest.useRealTimers();
      }
    });

    describe.each(['preview', 'production'])('outside development, on the %s channel', (channel) => {
      const initialDev = __DEV__;

      beforeEach(() => {
        mockUpdatesChannel = channel;
        Object.assign(globalThis, { __DEV__: false });
      });

      afterEach(() => {
        mockUpdatesChannel = null;
        Object.assign(globalThis, { __DEV__: initialDev });
      });

      it('checkForUpdates fakes the check on a simulator or emulator (no native call)', async () => {
        // arrange
        mockIsDevice = false;
        jest.useFakeTimers();
        const { result } = await renderHook(() => useUpdates());

        try {
          // act
          let pending: Promise<void> = Promise.resolve();
          await act(async () => {
            pending = result.current.checkForUpdates();
          });
          await act(async () => {
            await jest.advanceTimersByTimeAsync(1000);
            await pending;
          });

          // assert
          expect(Updates.checkForUpdateAsync).not.toHaveBeenCalled();
          expect(result.current.isLoading).toBe(false);
        } finally {
          jest.useRealTimers();
          mockIsDevice = true;
        }
      });

      it('checkForUpdates calls the native check', async () => {
        // arrange
        jest.mocked(Updates.checkForUpdateAsync).mockResolvedValue({} as never);
        const { result } = await renderHook(() => useUpdates());

        // act
        await act(async () => {
          await result.current.checkForUpdates();
        });

        // assert
        expect(Updates.checkForUpdateAsync).toHaveBeenCalledTimes(1);
        expect(mockLogger.info).toHaveBeenCalledWith('[checkForUpdateAsync] Checking for update on iOS Device');
      });

      it('checkForUpdates logs a warning on failure and resets isLoading', async () => {
        // arrange
        const failure = new Error('offline');
        jest.mocked(Updates.checkForUpdateAsync).mockRejectedValue(failure);
        const { result } = await renderHook(() => useUpdates());

        // act
        await act(async () => {
          await result.current.checkForUpdates();
        });

        // assert
        expect(result.current.isLoading).toBe(false);
        expect(mockLogger.warn).toHaveBeenCalledWith(
          '[useUpdates.checkForUpdates] Failed to check for updates:',
          failure
        );
        expect(mockLogger.error).not.toHaveBeenCalled();
      });
    });

    it('reloads the app when an update is pending', async () => {
      // arrange
      jest.mocked(Updates.reloadAsync).mockResolvedValue(undefined);
      setUpdatesState({ isUpdatePending: true });

      // act
      await renderHook(() => useUpdates());

      // assert
      expect(Updates.reloadAsync).toHaveBeenCalledTimes(1);
      expect(mockLogger.info).toHaveBeenCalledWith('[useUpdates.useEffect] Reloading app...');
    });

    it('does not reload when no update is pending', async () => {
      // act
      await renderHook(() => useUpdates());

      // assert
      expect(Updates.reloadAsync).not.toHaveBeenCalled();
    });

    it('handles a reload failure by logging it as an error', async () => {
      // arrange: a thenable that records rejection handlers, so the failure can be simulated without an unhandled rejection
      type Handler = (value: unknown) => unknown;
      const rejectionHandlers: Handler[] = [];
      const reload = {
        then: (_onFulfilled?: Handler, onRejected?: Handler) => {
          if (onRejected) rejectionHandlers.push(onRejected);
          return reload;
        },
        catch: (onRejected: Handler) => {
          rejectionHandlers.push(onRejected);
          return reload;
        },
      };
      jest.mocked(Updates.reloadAsync).mockReturnValue(reload as never);
      setUpdatesState({ isUpdatePending: true });
      const error = new Error('reload failed');

      // act
      await renderHook(() => useUpdates());
      await flushPromises();
      rejectionHandlers.forEach((handler) => handler(error));
      await flushPromises();

      // assert
      expect(rejectionHandlers).toHaveLength(1);
      expect(mockLogger.error).toHaveBeenCalledWith('[useUpdates.useEffect] Failed to reload app', error);
    });
  });

  describe('camera image picker', () => {
    const showSnackbarMessage = jest.fn();
    const wrapper = ({ children }: PropsWithChildren) => (
      <SnackbarContext.Provider value={{ showSnackbarMessage }}>{children}</SnackbarContext.Provider>
    );

    it.each`
      result                                                       | expected
      ${{ canceled: true, assets: null }}                          | ${null}
      ${{ canceled: false, assets: [] }}                           | ${null}
      ${{ canceled: false, assets: [{ uri: 'a' }, { uri: 'b' }] }} | ${'a'}
    `('toSinglePictureUri($result) → $expected', ({ result, expected }) => {
      expect(toSinglePictureUri(result)).toBe(expected);
    });

    it.each`
      status            | expected
      ${'granted'}      | ${true}
      ${'denied'}       | ${false}
      ${'undetermined'} | ${false}
    `('permission helpers map status $status → $expected', async ({ status, expected }) => {
      // arrange
      jest.mocked(ImagePicker.requestCameraPermissionsAsync).mockResolvedValue({ status } as never);
      jest.mocked(ImagePicker.requestMediaLibraryPermissionsAsync).mockResolvedValue({ status } as never);

      // act & assert
      expect(await requestTakePhotoPermissions()).toBe(expected);
      expect(await requestMediaLibPermissions()).toBe(expected);
    });

    it('pickImage launches the library with default options without asking permission', async () => {
      // arrange
      jest
        .mocked(ImagePicker.launchImageLibraryAsync)
        .mockResolvedValue({ canceled: false, assets: [{ uri: 'file:///p.jpg' }] } as never);
      const { result } = await renderHook(() => useCameraImagePicker(), { wrapper });

      // act
      const uri = await result.current.pickImage();

      // assert
      expect(uri).toBe('file:///p.jpg');
      expect(ImagePicker.launchImageLibraryAsync).toHaveBeenCalledWith({
        allowsEditing: true,
        aspect: [4, 3],
        quality: 0.7,
      });
      expect(ImagePicker.requestMediaLibraryPermissionsAsync).not.toHaveBeenCalled();
      expect(showSnackbarMessage).not.toHaveBeenCalled();
    });

    it('pickImage returns null when cancelled', async () => {
      // arrange
      jest.mocked(ImagePicker.launchImageLibraryAsync).mockResolvedValue({ canceled: true, assets: null } as never);
      const { result } = await renderHook(() => useCameraImagePicker(), { wrapper });

      // act & assert
      expect(await result.current.pickImage()).toBeNull();
    });

    it('pickImage logs, shows the error snackbar and returns null on failure', async () => {
      // arrange
      const failure = new Error('picker');
      jest.mocked(ImagePicker.launchImageLibraryAsync).mockRejectedValue(failure);
      const { result } = await renderHook(() => useCameraImagePicker(), { wrapper });

      // act
      const uri = await result.current.pickImage();

      // assert
      expect(uri).toBeNull();
      expect(mockLogger.error).toHaveBeenCalledWith('[useCameraImagePicker] Error picking image', failure);
      expect(showSnackbarMessage).toHaveBeenCalledTimes(1);
      expect(showSnackbarMessage.mock.calls[0][0]).toMatch(/imagePicker\.error|error/i);
    });

    it('takePhoto uses custom options once camera permission is granted', async () => {
      // arrange
      const options = { quality: 0.1 };
      jest.mocked(ImagePicker.requestCameraPermissionsAsync).mockResolvedValue({ status: 'granted' } as never);
      jest
        .mocked(ImagePicker.launchCameraAsync)
        .mockResolvedValue({ canceled: false, assets: [{ uri: 'file:///c.jpg' }] } as never);
      const { result } = await renderHook(() => useCameraImagePicker(options), { wrapper });

      // act
      const uri = await result.current.takePhoto();

      // assert
      expect(uri).toBe('file:///c.jpg');
      expect(ImagePicker.launchCameraAsync).toHaveBeenCalledWith(options);
    });

    it('takePhoto shows the permission-denied snackbar and returns null without launching the camera', async () => {
      // arrange
      jest.mocked(ImagePicker.requestCameraPermissionsAsync).mockResolvedValue({ status: 'denied' } as never);
      const { result } = await renderHook(() => useCameraImagePicker(), { wrapper });

      // act
      const uri = await result.current.takePhoto();

      // assert
      expect(uri).toBeNull();
      expect(ImagePicker.launchCameraAsync).not.toHaveBeenCalled();
      expect(showSnackbarMessage).toHaveBeenCalledTimes(1);
      expect(showSnackbarMessage.mock.calls[0][0]).toMatch(/permissionDenied|Permission denied/);
    });

    it('takePhoto logs, shows the error snackbar and returns null when the camera fails', async () => {
      // arrange
      const failure = new Error('camera');
      jest.mocked(ImagePicker.requestCameraPermissionsAsync).mockResolvedValue({ status: 'granted' } as never);
      jest.mocked(ImagePicker.launchCameraAsync).mockRejectedValue(failure);
      const { result } = await renderHook(() => useCameraImagePicker(), { wrapper });

      // act
      const uri = await result.current.takePhoto();

      // assert
      expect(uri).toBeNull();
      expect(mockLogger.error).toHaveBeenCalledWith('[useCameraImagePicker] Error picking image', failure);
      expect(showSnackbarMessage).toHaveBeenCalledTimes(1);
    });

    it('takePhoto propagates a permission request failure', async () => {
      // arrange
      jest.mocked(ImagePicker.requestCameraPermissionsAsync).mockRejectedValue(new Error('perm'));
      const { result } = await renderHook(() => useCameraImagePicker(), { wrapper });

      // act & assert
      await expect(result.current.takePhoto()).rejects.toThrow('perm');
    });
  });

  describe('useImagePicker', () => {
    it('starts with no selection and default dimensions', async () => {
      // act
      const { result } = await renderHook(() => useImagePicker());

      // assert
      expect(result.current.hasSelectedImage).toBe(false);
      expect(result.current.selectedImage).toBeUndefined();
      expect(result.current.dimensions).toEqual({ width: 0, height: 0, aspectRatio: 1 });
    });

    it('selects the picked image and reads its dimensions', async () => {
      // arrange
      jest
        .mocked(ImagePicker.launchImageLibraryAsync)
        .mockResolvedValue({ canceled: false, assets: [{ uri: 'file:///i.png' }] } as never);
      jest.spyOn(Image, 'getSize').mockImplementation((_uri, onSuccess) => onSuccess(200, 100));
      const { result } = await renderHook(() => useImagePicker());

      // act
      await act(async () => {
        await result.current.pickImage();
      });

      // assert
      expect(ImagePicker.launchImageLibraryAsync).toHaveBeenCalledWith({
        mediaTypes: ['images', 'livePhotos'],
        allowsEditing: true,
        quality: 1,
      });
      expect(result.current.selectedImage).toBe('file:///i.png');
      expect(result.current.hasSelectedImage).toBe(true);
      expect(result.current.dimensions).toEqual({ width: 200, height: 100, aspectRatio: 2 });
    });

    it('does not report a whitespace-only picked uri as a selected image', async () => {
      // arrange
      jest
        .mocked(ImagePicker.launchImageLibraryAsync)
        .mockResolvedValue({ canceled: false, assets: [{ uri: '   ' }] } as never);
      jest.spyOn(Image, 'getSize').mockImplementation(() => {});
      const { result } = await renderHook(() => useImagePicker());

      // act
      await act(async () => {
        await result.current.pickImage();
      });

      // assert
      expect(result.current.selectedImage).toBe('   ');
      expect(result.current.hasSelectedImage).toBe(false);
    });

    it('keeps the state when cancelled', async () => {
      // arrange
      const getSize = jest.spyOn(Image, 'getSize').mockImplementation(() => {});
      jest.mocked(ImagePicker.launchImageLibraryAsync).mockResolvedValueOnce({ canceled: true, assets: null } as never);
      const { result } = await renderHook(() => useImagePicker());

      // act
      await act(async () => {
        await result.current.pickImage();
      });

      // assert
      expect(result.current.hasSelectedImage).toBe(false);
      expect(getSize).not.toHaveBeenCalled();
    });

    it('logs an error when reading the dimensions fails', async () => {
      // arrange
      const failure = new Error('size');
      jest
        .mocked(ImagePicker.launchImageLibraryAsync)
        .mockResolvedValue({ canceled: false, assets: [{ uri: 'file:///i.png' }] } as never);
      jest.spyOn(Image, 'getSize').mockImplementation((_uri, _onSuccess, onError) => onError?.(failure));
      const { result } = await renderHook(() => useImagePicker());

      // act
      await act(async () => {
        await result.current.pickImage();
      });

      // assert
      expect(mockLogger.error).toHaveBeenCalledWith('Image.getSize failed', failure);
      expect(result.current.dimensions).toEqual({ width: 0, height: 0, aspectRatio: 1 });
    });
  });

  describe('useInvalidateQueriesOnFocus', () => {
    it('invalidates every key on focus and keeps the first keys on rerender', async () => {
      // arrange
      const queryClient = new QueryClient();
      const invalidate = jest.spyOn(queryClient, 'invalidateQueries').mockResolvedValue(undefined);
      const wrapper = ({ children }: PropsWithChildren) => (
        <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
      );

      // act
      const { rerender } = await renderHook(({ keys }: InvalidateQueriesProps) => useInvalidateQueriesOnFocus(keys), {
        wrapper,
        initialProps: { keys: [['a'], ['b', 1]] },
      });
      await rerender({ keys: [['c']] });

      // assert
      expect(invalidate.mock.calls.map(([filters]) => filters)).toEqual([{ queryKey: ['a'] }, { queryKey: ['b', 1] }]);
    });

    it('invalidates the latest keys when the screen is focused again', async () => {
      // arrange
      const queryClient = new QueryClient();
      const invalidate = jest.spyOn(queryClient, 'invalidateQueries').mockResolvedValue(undefined);
      const wrapper = ({ children }: PropsWithChildren) => (
        <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
      );
      const { rerender } = await renderHook(({ keys }: InvalidateQueriesProps) => useInvalidateQueriesOnFocus(keys), {
        wrapper,
        initialProps: { keys: [['a']] },
      });
      await rerender({ keys: [['c']] });
      invalidate.mockClear();

      // act
      await act(async () => mockLastFocusEffect?.());

      // assert
      expect(invalidate.mock.calls.map(([filters]) => filters)).toEqual([{ queryKey: ['c'] }]);
    });
  });

  describe('useTimeoutState', () => {
    it('is true until the timeout elapses', async () => {
      // arrange
      jest.useFakeTimers();
      try {
        const { result } = await renderHook(() => useTimeoutState(500));
        const before = result.current;

        // act
        await act(async () => {
          jest.advanceTimersByTime(500);
        });

        // assert
        expect(before).toBe(true);
        expect(result.current).toBe(false);
      } finally {
        jest.useRealTimers();
      }
    });

    it('stays false after the timeout, across re-renders', async () => {
      // arrange
      jest.useFakeTimers();
      try {
        const { result, rerender } = await renderHook(() => useTimeoutState(500));
        await act(async () => {
          jest.advanceTimersByTime(500);
        });

        // act
        await rerender({});
        await act(async () => {
          jest.advanceTimersByTime(5000);
        });

        // assert
        expect(result.current).toBe(false);
      } finally {
        jest.useRealTimers();
      }
    });

    it('restarts the timeout when timeoutMs changes before it elapses', async () => {
      // arrange
      jest.useFakeTimers();
      try {
        const { result, rerender } = await renderHook(
          ({ timeoutMs }: TimeoutStateProps) => useTimeoutState(timeoutMs),
          {
            initialProps: { timeoutMs: 500 },
          }
        );
        await act(async () => {
          jest.advanceTimersByTime(300);
        });

        // act
        await rerender({ timeoutMs: 1000 });
        await act(async () => {
          jest.advanceTimersByTime(300);
        });
        const afterOldTimeout = result.current;
        await act(async () => {
          jest.advanceTimersByTime(700);
        });

        // assert
        expect(afterOldTimeout).toBe(true);
        expect(result.current).toBe(false);
      } finally {
        jest.useRealTimers();
      }
    });
  });
});
