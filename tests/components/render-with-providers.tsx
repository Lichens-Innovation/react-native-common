import { BottomSheetModalProvider } from '@gorhom/bottom-sheet';
import { render } from '@testing-library/react-native';
import type { PropsWithChildren, ReactElement } from 'react';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { PaperProvider } from 'react-native-paper';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { LIGHT_THEME, SnackbarProvider } from '@lib';

export const TEST_THEME = LIGHT_THEME;

const initialMetrics = {
  frame: { x: 0, y: 0, width: 390, height: 844 },
  insets: { top: 0, left: 0, right: 0, bottom: 0 },
};

const NOISY_WARNINGS = [/react-i18next::/, /none of the required icon libraries are installed/];

// React Native provides requestIdleCallback at runtime; the Jest environment does not (used by SnackbarProvider) habit-hooks-disable non-essential-comment
if (typeof globalThis.requestIdleCallback !== 'function') {
  Object.assign(globalThis, { requestIdleCallback: (callback: () => void) => setTimeout(callback, 0) });
}

// eslint-disable-next-line no-console -- keeps the real console.warn to forward non-noisy warnings
const originalWarn = console.warn;
beforeEach(() => {
  jest.spyOn(console, 'warn').mockImplementation((...args: unknown[]) => {
    const [first] = args;
    if (typeof first === 'string' && NOISY_WARNINGS.some((pattern) => pattern.test(first))) {
      return;
    }
    originalWarn(...args);
  });
});

afterEach(() => {
  jest.restoreAllMocks();
});

export const TestProviders = ({ children }: PropsWithChildren) => (
  <GestureHandlerRootView>
    <SafeAreaProvider initialMetrics={initialMetrics}>
      <PaperProvider theme={TEST_THEME}>
        <BottomSheetModalProvider>
          <SnackbarProvider>{children}</SnackbarProvider>
        </BottomSheetModalProvider>
      </PaperProvider>
    </SafeAreaProvider>
  </GestureHandlerRootView>
);

export const renderWithProviders = (ui: ReactElement) => render(ui, { wrapper: TestProviders });

// Paper icons render a hidden "□" glyph under Jest (no icon font installed) habit-hooks-disable non-essential-comment
export const ICON_GLYPH = '□';
