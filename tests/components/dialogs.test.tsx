import Clipboard from '@react-native-clipboard/clipboard';
import { act, fireEvent, screen } from '@testing-library/react-native';
import { StyleSheet, Text } from 'react-native';
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
    ${'   '}     | ${0}          | ${'no icon when whitespace-only'}
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
    ${'  '}      | ${0}
  `('renders $expectedIcons icon(s) when icon=[$icon]', async ({ icon, expectedIcons }) => {
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
    ${'name'} | ${'   '}     | ${false}   | ${'populated value and whitespace-only errorMessage (not an error)'}
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

  it('does not render a whitespace-only errorMessage text', async () => {
    // act
    await renderDialog({ value: 'name', errorMessage: '   ' }).rendering;

    // assert
    expect(screen.queryAllByText('   ', { exact: true, normalizer: (text) => text })).toHaveLength(0);
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
    ${'  '}      | ${1}
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

// jest's window is 750 x 1334: wider than the 600 breakpoint, so dialogs are capped at 500 and centered habit-hooks-disable non-essential-comment
type HostElement = ReturnType<typeof screen.getByText>;

const ancestorsOf = (element: HostElement) => {
  const nodes: HostElement[] = [];
  for (let node = element.parent as HostElement | null; node; node = node.parent as HostElement | null)
    nodes.push(node);
  return nodes;
};

const styleOf = (element: HostElement) => StyleSheet.flatten(element.props.style) ?? {};

// nodes from `element` up to, excluding, the first ancestor it shares with `other` habit-hooks-disable non-essential-comment
const ownChain = (element: HostElement, other: HostElement) => {
  const shared = new Set(ancestorsOf(other));
  const chain = [element, ...ancestorsOf(element)];
  return chain.slice(
    0,
    chain.findIndex((node) => shared.has(node))
  );
};

const primaryButton = () => {
  const button = screen.getAllByRole('button').at(-1);
  if (!button) throw new Error('dialog buttons not found');
  return button;
};

// the dialog box is whatever wraps its buttons but not the backdrop; outermost first habit-hooks-disable non-essential-comment
const dialogBoxStyles = () => ownChain(primaryButton(), screen.getByLabelText('Close modal')).map(styleOf).reverse();
const dialogFrameStyle = () => dialogBoxStyles().find((style) => style.width !== undefined) ?? {};
const dialogSurfaceStyle = () => dialogBoxStyles().find((style) => style.maxHeight !== undefined) ?? {};
const pressBackdrop = () => fireEvent.press(screen.getByLabelText('Close modal'));

const DIALOGS = [
  ['DialogOkCancel', (props: object) => <DialogOkCancel isVisible onOk={jest.fn()} onCancel={jest.fn()} {...props} />],
  ['DialogCloseOnly', (props: object) => <DialogCloseOnly isVisible onClose={jest.fn()} {...props} />],
  [
    'DialogSingleTextInput',
    (props: object) => (
      <DialogSingleTextInput
        isVisible
        title="Rename"
        value=""
        onChange={jest.fn()}
        onOk={jest.fn()}
        onCancel={jest.fn()}
        {...props}
      />
    ),
  ],
  [
    'DialogSyntaxColorResult',
    (props: object) => (
      <DialogSyntaxColorResult isVisible title="Result" code="a" language="javascript" onClose={jest.fn()} {...props} />
    ),
  ],
] as const;

describe.each(DIALOGS)('%s frame', (_name, renderDialogElement) => {
  it('caps the width at 500 and centers on a wide screen', async () => {
    // act
    await renderWithProviders(renderDialogElement({}));

    // assert
    expect(dialogFrameStyle()).toMatchObject({ width: 500, alignSelf: 'center' });
  });
});

describe.each(DIALOGS.filter(([name]) => name !== 'DialogSyntaxColorResult'))(
  '%s style prop',
  (_name, renderDialogElement) => {
    it('lets the style prop override the frame sizing while keeping the rest', async () => {
      // act
      await renderWithProviders(renderDialogElement({ style: { width: 320 } }));

      // assert
      expect(dialogFrameStyle()).toMatchObject({ width: 320, alignSelf: 'center' });
    });
  }
);

describe('dialog OK button width', () => {
  const okButtonWidth = () =>
    ownChain(primaryButton(), screen.getByText('common:cancel'))
      .map(styleOf)
      .find((style) => style.width !== undefined)?.width;

  it.each`
    okLabel      | expectedWidth
    ${undefined} | ${60}
    ${'Delete'}  | ${undefined}
  `('DialogOkCancel OK button width is $expectedWidth when okLabel=$okLabel', async ({ okLabel, expectedWidth }) => {
    // act
    await renderWithProviders(<DialogOkCancel isVisible okLabel={okLabel} onOk={jest.fn()} onCancel={jest.fn()} />);

    // assert
    expect(okButtonWidth()).toBe(expectedWidth);
  });

  it('DialogSingleTextInput OK button is 60 wide', async () => {
    // act
    await renderWithProviders(
      <DialogSingleTextInput isVisible title="T" value="" onChange={jest.fn()} onOk={jest.fn()} onCancel={jest.fn()} />
    );

    // assert
    expect(okButtonWidth()).toBe(60);
  });
});

describe('dialog backdrop dismissal', () => {
  it.each`
    name                 | renderDialogElement
    ${'DialogOkCancel'}  | ${(onDismiss: () => void) => <DialogOkCancel isVisible onOk={jest.fn()} onCancel={jest.fn()} onDismiss={onDismiss} />}
    ${'DialogCloseOnly'} | ${(onDismiss: () => void) => <DialogCloseOnly isVisible onClose={jest.fn()} onDismiss={onDismiss} />}
  `('$name lets an onDismiss prop replace the default dismissal', async ({ renderDialogElement }) => {
    // arrange
    const onDismiss = jest.fn();
    await renderWithProviders(renderDialogElement(onDismiss));

    // act
    await pressBackdrop();

    // assert
    expect(onDismiss).toHaveBeenCalled();
  });

  it('DialogSingleTextInput always cancels on dismissal, ignoring an onDismiss prop', async () => {
    // arrange
    const onCancel = jest.fn();
    const onDismiss = jest.fn();
    await renderWithProviders(
      <DialogSingleTextInput
        isVisible
        title="T"
        value=""
        onChange={jest.fn()}
        onOk={jest.fn()}
        onCancel={onCancel}
        onDismiss={onDismiss}
      />
    );

    // act
    await pressBackdrop();

    // assert
    expect(onCancel).toHaveBeenCalled();
    expect(onDismiss).not.toHaveBeenCalled();
  });

  it('DialogSyntaxColorResult closes on dismissal', async () => {
    // arrange
    const onClose = jest.fn();
    await renderWithProviders(
      <DialogSyntaxColorResult isVisible title="R" code="a" language="javascript" onClose={onClose} />
    );

    // act
    await pressBackdrop();

    // assert
    expect(onClose).toHaveBeenCalled();
  });
});

describe('DialogSyntaxColorResult height', () => {
  it('caps its height at 80% of the window', async () => {
    // act
    await renderWithProviders(
      <DialogSyntaxColorResult isVisible title="R" code="a" language="javascript" onClose={jest.fn()} />
    );

    // assert
    expect(dialogSurfaceStyle()).toMatchObject({ maxHeight: 1334 * 0.8 });
  });

  // intentional change in the refactor: the style prop used to replace the frame sizing too (no consumer passes one) habit-hooks-disable non-essential-comment
  it('a style prop replaces its height cap but keeps the frame sizing', async () => {
    // act
    await renderWithProviders(
      <DialogSyntaxColorResult
        isVisible
        title="R"
        code="a"
        language="javascript"
        onClose={jest.fn()}
        style={{ width: 320 }}
      />
    );

    // assert
    expect(dialogFrameStyle().width).toBe(320);
    expect(dialogFrameStyle().alignSelf).toBe('center');
    expect(dialogSurfaceStyle().maxHeight).toBeUndefined();
  });
});
