import { act, fireEvent, render, renderHook, screen } from '@testing-library/react-native';
import { BackHandler, Pressable, Text } from 'react-native';
import { PaperProvider } from 'react-native-paper';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import {
  LIGHT_THEME,
  showSnackbarGlobal,
  SnackbarDurationsMs,
  SnackbarProvider,
  useBottomSheetToggler,
  useSnackbar,
} from '@lib';
import './render-with-providers';

describe('useBottomSheetToggler', () => {
  type BackListener = () => boolean | null | undefined;

  const setUp = async () => {
    const listeners: BackListener[] = [];
    const remove = jest.fn();
    jest.spyOn(BackHandler, 'addEventListener').mockImplementation(((_event: string, listener: BackListener) => {
      listeners.push(listener);
      return { remove };
    }) as never);
    const modal = { present: jest.fn(), dismiss: jest.fn() };
    const hook = await renderHook(() => useBottomSheetToggler());
    (hook.result.current.bottomSheetModalRef as { current: unknown }).current = modal;
    return { ...hook, listeners, remove, modal };
  };

  it('starts closed without listening to the hardware back button', async () => {
    // act
    const { result } = await setUp();

    // assert
    expect(result.current.isBottomSheetOpen).toBe(false);
    expect(BackHandler.addEventListener).not.toHaveBeenCalled();
  });

  it('showBottomSheet presents the modal and starts listening to the hardware back button', async () => {
    // arrange
    const { result, modal } = await setUp();

    // act
    await act(async () => result.current.showBottomSheet());

    // assert
    expect(modal.present).toHaveBeenCalledTimes(1);
    expect(result.current.isBottomSheetOpen).toBe(true);
    expect(BackHandler.addEventListener).toHaveBeenCalledWith('hardwareBackPress', expect.any(Function));
  });

  it('hideBottomSheet dismisses the modal and stops listening', async () => {
    // arrange
    const { result, modal, remove } = await setUp();
    await act(async () => result.current.showBottomSheet());

    // act
    await act(async () => result.current.hideBottomSheet());

    // assert
    expect(modal.dismiss).toHaveBeenCalledTimes(1);
    expect(result.current.isBottomSheetOpen).toBe(false);
    expect(remove).toHaveBeenCalledTimes(1);
  });

  it('hardware back closes the open sheet and consumes the event', async () => {
    // arrange
    const { result, modal, listeners, remove } = await setUp();
    await act(async () => result.current.showBottomSheet());

    // act
    let handled: boolean | null | undefined;
    await act(async () => {
      handled = listeners[listeners.length - 1]();
    });

    // assert
    expect(handled).toBe(true);
    expect(modal.dismiss).toHaveBeenCalledTimes(1);
    expect(result.current.isBottomSheetOpen).toBe(false);
    expect(remove).toHaveBeenCalled();
  });

  it('hardware back is not consumed when the modal ref is not attached', async () => {
    // arrange
    const { result, listeners } = await setUp();
    await act(async () => result.current.showBottomSheet());
    (result.current.bottomSheetModalRef as { current: unknown }).current = null;

    // act
    let handled: boolean | null | undefined;
    await act(async () => {
      handled = listeners[listeners.length - 1]();
    });

    // assert
    expect(handled).toBe(false);
    expect(result.current.isBottomSheetOpen).toBe(true);
  });

  it('works without an attached modal (optional chaining)', async () => {
    // arrange
    const { result } = await setUp();
    (result.current.bottomSheetModalRef as { current: unknown }).current = null;

    // act
    await act(async () => result.current.showBottomSheet());
    await act(async () => result.current.hideBottomSheet());

    // assert
    expect(result.current.isBottomSheetOpen).toBe(false);
  });

  it('stops listening on unmount while open', async () => {
    // arrange
    const { result, unmount, remove } = await setUp();
    await act(async () => result.current.showBottomSheet());

    // act
    await unmount();

    // assert
    expect(remove).toHaveBeenCalledTimes(1);
  });

  it('keeps a stable modal ref across renders', async () => {
    // arrange
    const { result } = await setUp();
    const ref = result.current.bottomSheetModalRef;

    // act
    await act(async () => result.current.showBottomSheet());

    // assert
    expect(result.current.bottomSheetModalRef).toBe(ref);
  });
});

describe('SnackbarDurationsMs', () => {
  it('pins the duration constants', () => {
    expect(SnackbarDurationsMs).toEqual({ SHORT: 2500, MEDIUM: 5000, LONG: 10000 });
  });
});

interface TriggerProps {
  message: string;
  duration?: number;
}

describe('SnackbarProvider / useSnackbar / showSnackbarGlobal', () => {
  let warnSpy: jest.SpyInstance;

  const initialMetrics = {
    frame: { x: 0, y: 0, width: 390, height: 844 },
    insets: { top: 0, left: 0, right: 0, bottom: 0 },
  };

  const Trigger = ({ message, duration }: TriggerProps) => {
    const { showSnackbarMessage } = useSnackbar();
    return (
      <Pressable
        accessibilityRole="button"
        accessibilityLabel={`show-${message}`}
        onPress={() => showSnackbarMessage(message, duration)}
      >
        <Text>trigger</Text>
      </Pressable>
    );
  };

  const renderProvider = (children: React.ReactNode) =>
    render(
      <SafeAreaProvider initialMetrics={initialMetrics}>
        <PaperProvider theme={LIGHT_THEME}>
          <SnackbarProvider>{children}</SnackbarProvider>
        </PaperProvider>
      </SafeAreaProvider>
    );

  const runIdle = () =>
    act(async () => {
      jest.advanceTimersByTime(1);
    });

  beforeEach(() => {
    jest.useFakeTimers();
    warnSpy = jest.spyOn(console, 'warn').mockImplementation(() => undefined);
  });
  afterEach(() => {
    jest.useRealTimers();
    jest.restoreAllMocks();
  });

  it('useSnackbar outside a provider returns a no-op', async () => {
    // arrange
    const { result } = await renderHook(() => useSnackbar());

    // act / assert
    expect(() => result.current.showSnackbarMessage('ignored')).not.toThrow();
  });

  it('showSnackbarGlobal before any provider is mounted warns and drops the message', () => {
    // act
    showSnackbarGlobal('too early');

    // assert
    expect(warnSpy).toHaveBeenCalledWith(
      '[Snackbar] showSnackbarGlobal called before SnackbarProvider mounted; dropping:',
      'too early'
    );
  });

  it('renders children and shows a message after the idle callback', async () => {
    // arrange
    await renderProvider(<Trigger message="Saved" />);

    // act
    await fireEvent.press(screen.getByRole('button', { name: 'show-Saved' }));
    const isShownSynchronously = screen.queryByText('Saved') !== null;
    await runIdle();

    // assert
    expect(screen.getByText('trigger')).toBeOnTheScreen();
    expect(isShownSynchronously).toBe(false);
    expect(screen.getByText('Saved')).toBeOnTheScreen();
  });

  it.each`
    duration                    | expectedVisibleMs
    ${undefined}                | ${SnackbarDurationsMs.SHORT}
    ${1000}                     | ${1000}
    ${SnackbarDurationsMs.LONG} | ${SnackbarDurationsMs.LONG}
  `('hides the message after $expectedVisibleMs ms (duration=$duration)', async ({ duration, expectedVisibleMs }) => {
    // arrange
    await renderProvider(<Trigger message="Hello" duration={duration} />);
    await fireEvent.press(screen.getByRole('button', { name: 'show-Hello' }));
    await runIdle();

    // act
    await act(async () => {
      jest.advanceTimersByTime(expectedVisibleMs - 1);
    });
    const isVisibleJustBefore = screen.queryByText('Hello') !== null;
    await act(async () => {
      jest.advanceTimersByTime(1);
    });
    await act(async () => {
      jest.runOnlyPendingTimers();
    });

    // assert
    expect(isVisibleJustBefore).toBe(true);
    expect(screen.queryByText('Hello')).toBeNull();
  });

  it('replaces the current message with the latest one', async () => {
    // arrange
    await renderProvider(
      <>
        <Trigger message="First" />
        <Trigger message="Second" />
      </>
    );
    await fireEvent.press(screen.getByRole('button', { name: 'show-First' }));
    await runIdle();

    // act
    await fireEvent.press(screen.getByRole('button', { name: 'show-Second' }));
    await runIdle();

    // assert
    expect(screen.queryByText('First')).toBeNull();
    expect(screen.getByText('Second')).toBeOnTheScreen();
  });

  it('showSnackbarGlobal shows the message once a provider is mounted, honouring the duration', async () => {
    // arrange
    await renderProvider(<Text>app</Text>);

    // act
    await act(async () => showSnackbarGlobal('Global', 500));
    await runIdle();
    const isShown = screen.queryByText('Global') !== null;
    await act(async () => {
      jest.advanceTimersByTime(500);
    });
    await act(async () => {
      jest.runOnlyPendingTimers();
    });

    // assert
    expect(isShown).toBe(true);
    expect(screen.queryByText('Global')).toBeNull();
    expect(warnSpy).not.toHaveBeenCalled();
  });

  it('showSnackbarGlobal drops messages again after the provider unmounts', async () => {
    // arrange
    const { unmount } = await renderProvider(<Text>app</Text>);

    // act
    await unmount();
    showSnackbarGlobal('after unmount');

    // assert
    expect(warnSpy).toHaveBeenCalledWith(expect.stringContaining('before SnackbarProvider mounted'), 'after unmount');
  });
});
