import { LIGHT_THEME, SnackbarContext } from '@lib';
import { RjsfPaperRenderer, type RjsfPaperRendererProps } from '@lib/rjsf';
import { render, screen } from '@testing-library/react-native';
import i18next, { type i18n } from 'i18next';
import type { PropsWithChildren, ReactElement } from 'react';
import { initReactI18next } from 'react-i18next';
import { PaperProvider } from 'react-native-paper';
import { SafeAreaProvider } from 'react-native-safe-area-context';

// No resources: t('common:a.b') resolves to the bare key 'a.b', which keeps assertions independent of copy. habit-hooks-disable non-essential-comment
export const testI18n: i18n = i18next.createInstance();
void testI18n.use(initReactI18next).init({
  lng: 'en',
  resources: {},
  defaultNS: 'common',
  interpolation: { escapeValue: false },
  initAsync: false,
});

const INITIAL_METRICS = {
  frame: { x: 0, y: 0, width: 400, height: 800 },
  insets: { top: 0, left: 0, right: 0, bottom: 0 },
};

export const showSnackbarMessageMock = jest.fn();

const Providers = ({ children }: PropsWithChildren) => (
  <SafeAreaProvider initialMetrics={INITIAL_METRICS}>
    <PaperProvider theme={LIGHT_THEME}>
      <SnackbarContext.Provider value={{ showSnackbarMessage: showSnackbarMessageMock }}>
        {children}
      </SnackbarContext.Provider>
    </PaperProvider>
  </SafeAreaProvider>
);

export const renderWithProviders = (ui: ReactElement) => render(ui, { wrapper: Providers });

interface FormProps extends Omit<RjsfPaperRendererProps, 'i18n'> {
  i18n?: i18n;
}

export const renderForm = (props: FormProps) => renderWithProviders(<RjsfPaperRenderer i18n={testI18n} {...props} />);

// Paper warns once per icon when no icon font package is installed (always the case under Jest). habit-hooks-disable non-essential-comment
// eslint-disable-next-line no-console -- keep a handle on the real console.warn to forward non-icon warnings
const originalWarn = console.warn;
jest.spyOn(console, 'warn').mockImplementation((message?: unknown, ...rest: unknown[]) => {
  if (typeof message === 'string' && message.startsWith('Tried to use the icon')) return;
  originalWarn(message, ...rest);
});

interface HostNode {
  props: Record<string, unknown>;
  // eslint-disable-next-line coding-guide/prefer-props-with-children -- host tree node shape, not React component props
  children: (HostNode | string)[];
}

// For host elements with no text/role/testID to query by. habit-hooks-disable non-essential-comment
export const findAllByProp = (key: string, value: unknown): HostNode[] => {
  const found: HostNode[] = [];
  const walk = (node: HostNode | string) => {
    if (typeof node === 'string') return;
    if (node.props?.[key] === value) found.push(node);
    node.children?.forEach(walk);
  };
  walk(screen.container as unknown as HostNode);
  return found;
};
