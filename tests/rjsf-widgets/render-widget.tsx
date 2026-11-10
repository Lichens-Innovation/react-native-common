import { LIGHT_THEME } from '@lib';
import type { WidgetProps } from '@rjsf/utils';
import { render, screen } from '@testing-library/react-native';
import type { ComponentType, PropsWithChildren, ReactElement } from 'react';
import { Text, View } from 'react-native';
import { PaperProvider } from 'react-native-paper';
import { SafeAreaProvider } from 'react-native-safe-area-context';

const INITIAL_METRICS = {
  frame: { x: 0, y: 0, width: 390, height: 844 },
  insets: { top: 0, left: 0, right: 0, bottom: 0 },
};

// paper has no icon font under Jest: expose each icon by name so tests can query it habit-hooks-disable non-essential-comment
interface LabelledIconProps {
  name: string;
}

const renderLabelledIcon = ({ name }: LabelledIconProps) => <Text accessibilityLabel={`icon-${name}`} />;

const PAPER_SETTINGS = { icon: renderLabelledIcon };

const Providers = ({ children }: PropsWithChildren) => (
  <SafeAreaProvider initialMetrics={INITIAL_METRICS}>
    <PaperProvider theme={LIGHT_THEME} settings={PAPER_SETTINGS}>
      {children}
    </PaperProvider>
  </SafeAreaProvider>
);

const WIDGET_HOST_LABEL = 'widget-host';

const ANY_TEXT = /.*/u;

export const getWidgetHost = () => screen.getByLabelText(WIDGET_HOST_LABEL);

// every text widget renders a single native input, whatever its value habit-hooks-disable non-essential-comment
export const getTextInput = () => screen.getByDisplayValue(ANY_TEXT);

export const renderWithProviders = (ui: ReactElement) =>
  render(<View accessibilityLabel={WIDGET_HOST_LABEL}>{ui}</View>, { wrapper: Providers });

interface WidgetTestProps extends WidgetProps {
  onChange: jest.Mock;
  onBlur: jest.Mock;
  onFocus: jest.Mock;
}

const makeWidgetProps = (overrides: Partial<WidgetProps> = {}): WidgetTestProps =>
  ({
    id: 'root_field',
    name: 'field',
    label: 'My label',
    value: undefined,
    required: false,
    disabled: false,
    readonly: false,
    autofocus: false,
    hideLabel: false,
    placeholder: '',
    rawErrors: [],
    options: {},
    schema: { type: 'string' },
    uiSchema: {},
    formContext: {},
    registry: {} as WidgetProps['registry'],
    onChange: jest.fn(),
    onBlur: jest.fn(),
    onFocus: jest.fn(),
    ...overrides,
  }) as WidgetTestProps;

export const renderWidget = async (Widget: ComponentType<WidgetProps>, overrides: Partial<WidgetProps> = {}) => {
  const props = makeWidgetProps(overrides);
  const widgetProps: WidgetProps = props;
  const result = await renderWithProviders(<Widget {...widgetProps} />);
  const rerenderWidget = (next: Partial<WidgetProps>) => {
    const nextProps: WidgetProps = { ...widgetProps, ...next };
    return result.rerender(
      <View accessibilityLabel={WIDGET_HOST_LABEL}>
        <Widget {...nextProps} />
      </View>
    );
  };
  return { ...result, props, rerenderWidget };
};

// paper icons and react-i18next (no instance) warn on every render habit-hooks-disable non-essential-comment
beforeEach(() => {
  jest.spyOn(console, 'warn').mockImplementation(() => {});
});

afterEach(() => {
  jest.restoreAllMocks();
});
