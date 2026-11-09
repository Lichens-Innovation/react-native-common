import Clipboard from '@react-native-clipboard/clipboard';
import { act, fireEvent, screen } from '@testing-library/react-native';
import { Text } from 'react-native';
import { DialogCloseOnly, DialogOkCancel, DialogSingleTextInput, DialogSyntaxColorResult } from '@lib';
import { ICON_GLYPH, renderWithProviders } from './render-with-providers';

const iconCount = () => screen.queryAllByText(ICON_GLYPH, { includeHiddenElements: true }).length;

describe('DialogOkCancel', () => {
  const renderDialog = (props: Partial<Parameters<typeof DialogOkCancel>[0]> = {}) => {
    const onOk = jest.fn();
    const onCancel = jest.fn();
    const rendering = renderWithProviders(<DialogOkCancel isVisible onOk={onOk} onCancel={onCancel} {...props} />);
    return { onOk, onCancel, rendering };
  };

  it('renders nothing when not visible', async () => {
    // act
    await renderDialog({ isVisible: false, title: 'Title' }).rendering;

    // assert
    expect(screen.queryByText('Title')).toBeNull();
    expect(screen.queryByText('common:ok')).toBeNull();
  });

  it('renders title, description and default buttons', async () => {
    // act
    await renderDialog({ title: 'Title', description: 'Description' }).rendering;

    // assert
    expect(screen.getByText('Title')).toBeOnTheScreen();
    expect(screen.getByText('Description')).toBeOnTheScreen();
    expect(screen.getByText('common:cancel')).toBeOnTheScreen();
    expect(screen.getByText('common:ok')).toBeOnTheScreen();
  });

  it('renders ReactNode title and description as-is', async () => {
    // act
    await renderDialog({ title: <Text>Node title</Text>, description: <Text>Node description</Text> }).rendering;

    // assert
    expect(screen.getByText('Node title')).toBeOnTheScreen();
    expect(screen.getByText('Node description')).toBeOnTheScreen();
  });

  it.each`
    okLabel      | expected
    ${undefined} | ${'common:ok'}
    ${'Delete'}  | ${'Delete'}
    ${''}        | ${''}
  `('labels the ok button "$expected" when okLabel=$okLabel', async ({ okLabel, expected }) => {
    // act
    await renderDialog({ okLabel }).rendering;

    // assert
    const okButton = screen.getAllByRole('button').at(-1);
    expect(okButton).toHaveTextContent(expected, { exact: true });
  });

  it.each`
    icon         | expectedIcons | description
    ${undefined} | ${0}          | ${'no icon when undefined'}
    ${''}        | ${0}          | ${'no icon when empty'}
    ${'alert'}   | ${1}          | ${'an icon when set'}
    ${'   '}     | ${1}          | ${'an icon when whitespace-only (treated as set)'}
  `('renders $description', async ({ icon, expectedIcons }) => {
    // act
    await renderDialog({ icon }).rendering;

    // assert
    expect(iconCount()).toBe(expectedIcons);
  });

  it('calls onOk / onCancel from the buttons', async () => {
    // arrange
    const { onOk, onCancel, rendering } = renderDialog();
    await rendering;

    // act
    await fireEvent.press(screen.getByText('common:ok'));
    await fireEvent.press(screen.getByText('common:cancel'));

    // assert
    expect(onOk).toHaveBeenCalledTimes(1);
    expect(onCancel).toHaveBeenCalledTimes(1);
  });

  it('calls onCancel when the backdrop dismisses the dialog', async () => {
    // arrange
    const { onCancel, rendering } = renderDialog();
    await rendering;

    // act
    await fireEvent.press(screen.getByLabelText('Close modal'));

    // assert
    expect(onCancel).toHaveBeenCalled();
  });
});

describe('DialogCloseOnly', () => {
  const renderDialog = (props: Partial<Parameters<typeof DialogCloseOnly>[0]> = {}) => {
    const onClose = jest.fn();
    const rendering = renderWithProviders(<DialogCloseOnly isVisible onClose={onClose} {...props} />);
    return { onClose, rendering };
  };

  it('renders nothing when not visible', async () => {
    // act
    await renderDialog({ isVisible: false, title: 'Title' }).rendering;

    // assert
    expect(screen.queryByText('common:close')).toBeNull();
  });

  it('renders title, content and close button', async () => {
    // act
    await renderDialog({ title: 'Title', content: <Text>Body</Text> }).rendering;

    // assert
    expect(screen.getByText('Title')).toBeOnTheScreen();
    expect(screen.getByText('Body')).toBeOnTheScreen();
    expect(screen.getByText('common:close')).toBeOnTheScreen();
  });

  it.each`
    icon         | expectedIcons
    ${undefined} | ${0}
    ${''}        | ${0}
    ${'info'}    | ${1}
    ${'  '}      | ${1}
  `('renders $expectedIcons icon(s) when icon=[$icon] (whitespace treated as set)', async ({ icon, expectedIcons }) => {
    // act
    await renderDialog({ icon }).rendering;

    // assert
    expect(iconCount()).toBe(expectedIcons);
  });

  it('calls onClose from the button', async () => {
    // arrange
    const { onClose, rendering } = renderDialog();
    await rendering;

    // act
    await fireEvent.press(screen.getByText('common:close'));

    // assert
    expect(onClose).toHaveBeenCalledTimes(1);
  });
});

describe('DialogSingleTextInput', () => {
  const renderDialog = (props: Partial<Parameters<typeof DialogSingleTextInput>[0]> = {}) => {
    const onOk = jest.fn();
    const onCancel = jest.fn();
    const onChange = jest.fn();
    const rendering = renderWithProviders(
      <DialogSingleTextInput
        isVisible
        title="Rename"
        value=""
        onChange={onChange}
        onOk={onOk}
        onCancel={onCancel}
        {...props}
      />
    );
    return { onOk, onCancel, onChange, rendering };
  };

  const isOkDisabled = () => {
    const okButton = screen.getAllByRole('button').at(-1);
    return okButton?.props.accessibilityState?.disabled === true;
  };

  it('renders nothing when not visible', async () => {
    // act
    await renderDialog({ isVisible: false }).rendering;

    // assert
    expect(screen.queryByText('Rename')).toBeNull();
  });

  it('renders title, description and placeholder', async () => {
    // act
    await renderDialog({ description: 'Choose a name', placeholder: 'Name' }).rendering;

    // assert
    expect(screen.getByText('Rename')).toBeOnTheScreen();
    expect(screen.getByText('Choose a name')).toBeOnTheScreen();
    expect(screen.getByPlaceholderText('Name')).toBeOnTheScreen();
  });

  it.each`
    value     | errorMessage | isDisabled | description
    ${''}     | ${undefined} | ${true}    | ${'empty value'}
    ${'   '}  | ${undefined} | ${true}    | ${'whitespace-only value'}
    ${'name'} | ${undefined} | ${false}   | ${'populated value'}
    ${'name'} | ${''}        | ${false}   | ${'populated value and empty errorMessage'}
    ${'name'} | ${'Taken'}   | ${true}    | ${'populated value and an error'}
    ${'name'} | ${'   '}     | ${true}    | ${'populated value and whitespace-only errorMessage (treated as an error)'}
  `('ok disabled=$isDisabled with $description', async ({ value, errorMessage, isDisabled }) => {
    // act
    await renderDialog({ value, errorMessage }).rendering;

    // assert
    expect(isOkDisabled()).toBe(isDisabled);
  });

  it('shows the error message', async () => {
    // act
    await renderDialog({ value: 'name', errorMessage: 'Already taken' }).rendering;

    // assert
    expect(screen.getByText('Already taken')).toBeOnTheScreen();
  });

  it('renders the whitespace-only errorMessage text', async () => {
    // act
    await renderDialog({ value: 'name', errorMessage: '   ' }).rendering;

    // assert
    expect(screen.queryAllByText('   ', { exact: true, normalizer: (text) => text })).toHaveLength(1);
  });

  it('forwards typed text to onChange and submits the latest input value', async () => {
    // arrange
    const { onOk, onChange, rendering } = renderDialog({ value: 'old', placeholder: 'Name' });
    await rendering;

    // act
    await fireEvent.changeText(screen.getByPlaceholderText('Name'), 'new name');
    await fireEvent.press(screen.getByText('common:ok'));

    // assert
    expect(onChange).toHaveBeenCalledWith('new name');
    expect(onOk).toHaveBeenCalledWith('new name');
  });

  it('keeps its own input state when the value prop changes after mount', async () => {
    // arrange
    const onOk = jest.fn();
    const props = { isVisible: true, title: 'Rename', onChange: jest.fn(), onOk, onCancel: jest.fn() };
    const { rerender } = await renderWithProviders(<DialogSingleTextInput {...props} value="first" />);

    // act
    await rerender(<DialogSingleTextInput {...props} value="second" />);
    await fireEvent.press(screen.getByText('common:ok'));

    // assert
    expect(onOk).toHaveBeenCalledWith('first');
  });

  it('calls onCancel from the cancel button', async () => {
    // arrange
    const { onCancel, rendering } = renderDialog();
    await rendering;

    // act
    await fireEvent.press(screen.getByText('common:cancel'));

    // assert
    expect(onCancel).toHaveBeenCalledTimes(1);
  });
});

describe('DialogSyntaxColorResult', () => {
  const renderDialog = (props: Partial<Parameters<typeof DialogSyntaxColorResult>[0]> = {}) => {
    const onClose = jest.fn();
    const rendering = renderWithProviders(
      <DialogSyntaxColorResult
        isVisible
        title="Result"
        code="const a = 1;"
        language="javascript"
        onClose={onClose}
        {...props}
      />
    );
    return { onClose, rendering };
  };

  beforeEach(() => jest.useFakeTimers());
  afterEach(() => jest.useRealTimers());

  it('renders nothing when not visible', async () => {
    // act
    await renderDialog({ isVisible: false }).rendering;

    // assert
    expect(screen.queryByText('Result')).toBeNull();
  });

  it('renders the title, copy and close buttons', async () => {
    // act
    await renderDialog().rendering;

    // assert
    expect(screen.getByText('Result')).toBeOnTheScreen();
    expect(screen.getByText('common:copy')).toBeOnTheScreen();
    expect(screen.getByText('common:close')).toBeOnTheScreen();
  });

  it('renders the raw code when it exceeds maxCodeLength', async () => {
    // act
    await renderDialog({ code: 'abcdef', maxCodeLength: 3 }).rendering;

    // assert
    expect(screen.getByText('abcdef')).toBeOnTheScreen();
  });

  it.each`
    icon         | expectedIcons
    ${undefined} | ${1}
    ${''}        | ${1}
    ${'code'}    | ${2}
    ${'  '}      | ${2}
  `(
    'renders $expectedIcons icon glyph(s) (copy button + optional dialog icon) when icon=[$icon]',
    async ({ icon, expectedIcons }) => {
      // act
      await renderDialog({ icon }).rendering;

      // assert
      expect(iconCount()).toBe(expectedIcons);
    }
  );

  it('copies the code to the clipboard and shows a snackbar', async () => {
    // arrange
    await renderDialog({ code: 'SELECT 1;' }).rendering;

    // act
    await fireEvent.press(screen.getByText('common:copy'));
    await act(async () => {
      jest.runOnlyPendingTimers();
    });

    // assert
    expect(Clipboard.setString).toHaveBeenCalledWith('SELECT 1;');
    expect(screen.getByText('common:copiedToClipboard')).toBeOnTheScreen();
  });

  it('calls onClose from the close button', async () => {
    // arrange
    const { onClose, rendering } = renderDialog();
    await rendering;

    // act
    await fireEvent.press(screen.getByText('common:close'));

    // assert
    expect(onClose).toHaveBeenCalledTimes(1);
  });
});
