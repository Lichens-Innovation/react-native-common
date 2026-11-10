import { render } from '@testing-library/react-native';
import i18next from 'i18next';
import type { PropsWithChildren, ReactElement } from 'react';
import { I18nextProvider, initReactI18next } from 'react-i18next';
import { PaperProvider } from 'react-native-paper';
import { SafeAreaProvider } from 'react-native-safe-area-context';

const initialMetrics = {
  frame: { x: 0, y: 0, width: 390, height: 844 },
  insets: { top: 0, left: 0, right: 0, bottom: 0 },
};

// cimode: t() returns the key, so assertions do not depend on translations habit-hooks-disable non-essential-comment
const testI18n = i18next.createInstance();
void testI18n.use(initReactI18next).init({ lng: 'cimode', resources: {}, initAsync: false });

const Providers = ({ children }: PropsWithChildren) => (
  <I18nextProvider i18n={testI18n}>
    <SafeAreaProvider initialMetrics={initialMetrics}>
      <PaperProvider>{children}</PaperProvider>
    </SafeAreaProvider>
  </I18nextProvider>
);

export const renderWithProviders = (ui: ReactElement) => render(ui, { wrapper: Providers });
