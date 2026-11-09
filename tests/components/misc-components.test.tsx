import { act, fireEvent, screen } from '@testing-library/react-native';
import { Camera, CameraView } from 'expo-camera';
import { StyleSheet, Text } from 'react-native';
import {
  BarcodeScannerDialog,
  CodeTag,
  commonStore,
  HeaderButton,
  logger,
  OnOffToggle,
  OrientationAwareTabButton,
  PreTag,
  SyntaxColoring,
  TabBarIcon,
} from '@lib';
import { ICON_GLYPH, renderWithProviders, TEST_THEME } from './render-with-providers';

const { colors } = TEST_THEME;

const flushPromises = () =>
  act(async () => {
    await new Promise<void>((resolve) => setImmediate(() => resolve()));
  });

describe('SyntaxColoring', () => {
  it.each`
    code              | maxCodeLength | isHighlighted | description
    ${'const a = 1;'} | ${undefined}  | ${true}       | ${'no max length'}
    ${'const a = 1;'} | ${0}          | ${true}       | ${'max length 0 (falsy: highlighting kept)'}
    ${'abc'}          | ${4}          | ${true}       | ${'code shorter than max'}
    ${'abcd'}         | ${4}          | ${false}      | ${'code length equal to max'}
    ${'abcdef'}       | ${4}          | ${false}      | ${'code longer than max'}
  `('highlighted=$isHighlighted for $description', async ({ code, maxCodeLength, isHighlighted }) => {
    // act
    await renderWithProviders(<SyntaxColoring code={code} language="javascript" maxCodeLength={maxCodeLength} />);

    // assert
    expect(screen.getByText(code).props.numberOfLines === 0).toBe(!isHighlighted);
    expect(screen.root).toHaveTextContent(new RegExp(code.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')));
  });

  it('switches styles with the dark mode flag of the common store without crashing', async () => {
    // arrange
    const initial = commonStore.isDarkMode;

    // act
    await act(async () => commonStore.setIsDarkMode(!initial));
    await renderWithProviders(<SyntaxColoring code="let b" language="javascript" />);

    // assert
    expect(screen.root).toHaveTextContent(/let b/);
    await act(async () => commonStore.setIsDarkMode(initial));
  });
});

describe('CodeTag / PreTag', () => {
  it('CodeTag renders children in a monospace text, merging style and forwarding props', async () => {
    // act
    await renderWithProviders(
      <CodeTag style={{ color: 'red' }} accessibilityLabel="code">
        hello
      </CodeTag>
    );

    // assert
    const text = screen.getByLabelText('code');
    expect(text).toHaveTextContent('hello');
    expect(StyleSheet.flatten(text.props.style)).toMatchObject({ color: 'red', fontFamily: expect.any(String) });
  });

  it('PreTag renders children in a horizontal scroll view with the given style and props', async () => {
    // act
    await renderWithProviders(
      <PreTag style={{ padding: 3 }} accessibilityLabel="pre">
        <Text>inside</Text>
      </PreTag>
    );

    // assert
    const pre = screen.getByLabelText('pre');
    expect(pre.props.horizontal).toBe(true);
    expect(StyleSheet.flatten(pre.props.style)).toMatchObject({ padding: 3 });
    expect(screen.getByText('inside')).toBeOnTheScreen();
  });
});

describe('HeaderButton', () => {
  it('renders an icon button that calls onPress', async () => {
    // arrange
    const onPress = jest.fn();
    await renderWithProviders(<HeaderButton iconName="cog" onPress={onPress} />);

    // act
    await fireEvent.press(screen.getByRole('button'));

    // assert
    expect(onPress).toHaveBeenCalledTimes(1);
  });

  it('merges the style prop over the default margins', async () => {
    // act
    await renderWithProviders(<HeaderButton iconName="cog" style={{ marginVertical: 4 }} />);

    // assert
    // eslint-disable-next-line coding-guide/prefer-role-query-over-testid -- Paper applies the style to its role-less outer Surface, only reachable by its testID
    expect(StyleSheet.flatten(screen.getByTestId('icon-button-container-outer-layer').props.style)).toMatchObject({
      marginHorizontal: 16,
      marginVertical: 4,
    });
  });
});

describe('OnOffToggle', () => {
  const segments = () => screen.getAllByRole('button');

  it.each`
    isOn     | checkedIndex
    ${true}  | ${0}
    ${false} | ${1}
  `('checks segment $checkedIndex when isOn=$isOn', async ({ isOn, checkedIndex }) => {
    // act
    await renderWithProviders(<OnOffToggle isOn={isOn} onValueChange={jest.fn()} />);

    // assert
    expect(segments()[checkedIndex].props.accessibilityState).toMatchObject({ checked: true });
    expect(segments()[1 - checkedIndex].props.accessibilityState).toMatchObject({ checked: false });
  });

  it.each`
    isOn     | pressedIndex | expected
    ${false} | ${0}         | ${true}
    ${true}  | ${1}         | ${false}
  `('calls onValueChange($expected) when pressing segment $pressedIndex', async ({ isOn, pressedIndex, expected }) => {
    // arrange
    const onValueChange = jest.fn();
    await renderWithProviders(<OnOffToggle isOn={isOn} onValueChange={onValueChange} />);

    // act
    await fireEvent.press(segments()[pressedIndex]);

    // assert
    expect(onValueChange).toHaveBeenCalledWith(expected);
  });
});

describe('TabBarIcon', () => {
  it('renders an icon (library prop is ignored)', async () => {
    // act
    await renderWithProviders(<TabBarIcon name="home" library="Feather" color="red" />);

    // assert
    expect(screen.getByText(ICON_GLYPH, { includeHiddenElements: true })).toBeTruthy();
  });

  it('uses size 28 by default', async () => {
    // act
    await renderWithProviders(<TabBarIcon name="home" color="red" />);

    // assert
    expect(StyleSheet.flatten(screen.getByText(ICON_GLYPH, { includeHiddenElements: true }).props.style)).toMatchObject(
      {
        fontSize: 28,
        color: 'red',
      }
    );
  });
});

describe('OrientationAwareTabButton', () => {
  const renderButton = (props: Partial<Parameters<typeof OrientationAwareTabButton>[0]> = {}) =>
    renderWithProviders(<OrientationAwareTabButton icon="home" title="Home" activeColor="#00ff00" {...props} />);

  it.each`
    isFocused    | expectedColor
    ${true}      | ${'#00ff00'}
    ${false}     | ${colors.onSurfaceDisabled}
    ${undefined} | ${colors.onSurfaceDisabled}
  `('colors title and icon with $expectedColor when isFocused=$isFocused', async ({ isFocused, expectedColor }) => {
    // act
    await renderButton({ isFocused });

    // assert
    expect(StyleSheet.flatten(screen.getByText('Home').props.style).color).toBe(expectedColor);
    expect(StyleSheet.flatten(screen.getByText(ICON_GLYPH, { includeHiddenElements: true }).props.style).color).toBe(
      expectedColor
    );
  });

  it.each`
    isLabelHidden | isVisible
    ${undefined}  | ${true}
    ${false}      | ${true}
    ${true}       | ${false}
  `('label visible=$isVisible when isLabelHidden=$isLabelHidden', async ({ isLabelHidden, isVisible }) => {
    // act
    await renderButton({ isLabelHidden });

    // assert
    expect(screen.queryByText('Home') !== null).toBe(isVisible);
  });

  it('forwards press handlers', async () => {
    // arrange
    const onPress = jest.fn();
    await renderButton({ onPress });

    // act
    await fireEvent.press(screen.getByText('Home'));

    // assert
    expect(onPress).toHaveBeenCalledTimes(1);
  });
});

describe('BarcodeScannerDialog', () => {
  // expo-camera is auto-mocked as a Proxy: `Camera` is itself a jest.fn without static methods habit-hooks-disable non-essential-comment
  const requestPermission = jest.fn();
  (Camera as unknown as { requestCameraPermissionsAsync: jest.Mock }).requestCameraPermissionsAsync = requestPermission;

  const renderDialog = (props: Partial<Parameters<typeof BarcodeScannerDialog>[0]> = {}) =>
    renderWithProviders(
      <BarcodeScannerDialog isVisible title="Scan" onClose={jest.fn()} onBarcodeScanned={jest.fn()} {...props} />
    );

  beforeEach(() => jest.clearAllMocks());

  it('renders nothing when not visible but still requests the permission', async () => {
    // arrange
    requestPermission.mockResolvedValue({ status: 'granted' } as never);

    // act
    await renderDialog({ isVisible: false });
    await flushPromises();

    // assert
    expect(screen.queryByText('Scan')).toBeNull();
    expect(requestPermission).toHaveBeenCalledTimes(1);
  });

  it('shows the dialog with the requesting message while the permission is pending', async () => {
    // arrange
    requestPermission.mockReturnValue(new Promise(() => undefined));

    // act
    await renderDialog();

    // assert
    expect(screen.getByText('Scan')).toBeOnTheScreen();
    expect(screen.getByText('common:close')).toBeOnTheScreen();
    expect(jest.mocked(CameraView)).not.toHaveBeenCalled();
  });

  it('renders the camera scanner once the permission is granted', async () => {
    // arrange
    requestPermission.mockResolvedValue({ status: 'granted' } as never);
    const onBarcodeScanned = jest.fn();

    // act
    await renderDialog({ onBarcodeScanned });
    await flushPromises();

    // assert
    expect(screen.getByText('common:barcodeScanner.scanBarcodeInstruction')).toBeOnTheScreen();
    expect(jest.mocked(CameraView).mock.lastCall?.[0]).toMatchObject({ onBarcodeScanned, facing: 'back' });
  });

  it.each`
    setUp                                                                       | description
    ${() => requestPermission.mockResolvedValue({ status: 'denied' } as never)} | ${'denied'}
    ${() => requestPermission.mockRejectedValue(new Error('no camera'))}        | ${'request failure'}
  `('does not render the camera on $description', async ({ setUp }) => {
    // arrange
    setUp();

    // act
    await renderDialog();
    await flushPromises();

    // assert
    expect(screen.getByText('Scan')).toBeOnTheScreen();
    expect(screen.queryByText('common:barcodeScanner.scanBarcodeInstruction')).toBeNull();
    expect(jest.mocked(CameraView)).not.toHaveBeenCalled();
  });

  it('logs the permission request failure', async () => {
    // arrange
    const error = new Error('no camera');
    requestPermission.mockRejectedValue(error);
    const errorSpy = jest.spyOn(logger, 'error');

    // act
    await renderDialog();
    await flushPromises();

    // assert
    expect(errorSpy).toHaveBeenCalledWith('[BarcodeScanner] Failed to request camera permissions', error);
  });

  it('calls onClose from the close button', async () => {
    // arrange
    requestPermission.mockResolvedValue({ status: 'denied' } as never);
    const onClose = jest.fn();
    await renderDialog({ onClose });
    await flushPromises();

    // act
    await fireEvent.press(screen.getByText('common:close'));

    // assert
    expect(onClose).toHaveBeenCalledTimes(1);
  });
});
