import {
  AddButton,
  ClearButton,
  CopyButton,
  FormSubmitContext,
  MoveDownButton,
  MoveUpButton,
  RemoveButton,
  SubmitButton,
  SubmitButtonOptionsContext,
  type IconButtonProps,
} from '@lib/rjsf';
import type { RjsfRegistryWithTranslate } from '@lichens-innovation/ts-common/rjsf';
import { TranslatableString } from '@rjsf/utils';
import { fireEvent, screen } from '@testing-library/react-native';
import type { FunctionComponent } from 'react';
import { renderWithProviders } from './render-with-providers';

const makeRegistry = () =>
  ({ translateString: jest.fn((key: string) => `t(${key})`) }) as unknown as RjsfRegistryWithTranslate;

const ICON_BUTTONS: [string, FunctionComponent<IconButtonProps>, TranslatableString][] = [
  ['AddButton', AddButton, TranslatableString.AddItemButton],
  ['CopyButton', CopyButton, TranslatableString.CopyButton],
  ['MoveDownButton', MoveDownButton, TranslatableString.MoveDownButton],
  ['MoveUpButton', MoveUpButton, TranslatableString.MoveUpButton],
  ['RemoveButton', RemoveButton, TranslatableString.RemoveButton],
  ['ClearButton', ClearButton, TranslatableString.ClearButton],
];

describe.each(ICON_BUTTONS)('%s', (_name, Button, translatable) => {
  it('uses the translated label as accessibilityLabel when no title is given', async () => {
    // arrange
    const registry = makeRegistry();

    // act
    await renderWithProviders(<Button registry={registry} />);

    // assert
    expect(registry.translateString).toHaveBeenCalledWith(translatable);
    expect(screen.getByLabelText(`t(${translatable})`)).toBeOnTheScreen();
  });

  it('prefers title over the translated label', async () => {
    // act
    await renderWithProviders(<Button registry={makeRegistry()} title="Custom title" />);

    // assert
    expect(screen.getByLabelText('Custom title')).toBeOnTheScreen();
    expect(screen.queryByLabelText(`t(${translatable})`)).toBeNull();
  });

  it('uses an empty-string title as-is (nullish coalescing, not falsy check)', async () => {
    // act
    await renderWithProviders(<Button registry={makeRegistry()} title="" />);

    // assert
    expect(screen.queryByLabelText(`t(${translatable})`)).toBeNull();
    expect(screen.getByRole('button')).toHaveProp('accessibilityLabel', '');
  });

  it('calls onClick when pressed', async () => {
    // arrange
    const onClick = jest.fn();
    await renderWithProviders(<Button registry={makeRegistry()} onClick={onClick} />);

    // act
    await fireEvent.press(screen.getByRole('button'));

    // assert
    expect(onClick).toHaveBeenCalledTimes(1);
  });

  it('is disabled and does not call onClick when disabled', async () => {
    // arrange
    const onClick = jest.fn();
    await renderWithProviders(<Button registry={makeRegistry()} onClick={onClick} disabled />);

    // act
    await fireEvent.press(screen.getByRole('button'));

    // assert
    expect(screen.getByRole('button')).toBeDisabled();
    expect(onClick).not.toHaveBeenCalled();
  });

  it('ignores readonly (still pressable)', async () => {
    // arrange
    const onClick = jest.fn();
    await renderWithProviders(<Button registry={makeRegistry()} onClick={onClick} readonly />);

    // act
    await fireEvent.press(screen.getByRole('button'));

    // assert
    expect(onClick).toHaveBeenCalledTimes(1);
  });
});

describe('SubmitButton', () => {
  interface SubmitCtx {
    absolute?: boolean;
    overrideLabel?: string | null;
  }

  const renderSubmit = (
    submit: jest.Mock,
    uiSchema?: Record<string, unknown>,
    { absolute = false, overrideLabel = null }: SubmitCtx = {}
  ) =>
    renderWithProviders(
      <FormSubmitContext.Provider value={submit}>
        <SubmitButtonOptionsContext.Provider
          value={{ submitButtonAbsolutePosition: absolute, submitButtonOverrideLabel: overrideLabel }}
        >
          <SubmitButton uiSchema={uiSchema} />
        </SubmitButtonOptionsContext.Provider>
      </FormSubmitContext.Provider>
    );

  it('renders the default submit text and submits a fake event with no-op preventDefault/persist', async () => {
    // arrange
    const submit = jest.fn();
    await renderSubmit(submit);

    // act
    await fireEvent.press(screen.getByText('Submit'));

    // assert
    expect(submit).toHaveBeenCalledTimes(1);
    const event = submit.mock.calls[0][0];
    expect(() => event.preventDefault()).not.toThrow();
    expect(() => event.persist()).not.toThrow();
  });

  it('uses ui:submitButtonOptions.submitText', async () => {
    // act
    await renderSubmit(jest.fn(), { 'ui:submitButtonOptions': { submitText: 'Save it' } });

    // assert
    expect(screen.getByText('Save it')).toBeOnTheScreen();
  });

  it('renders nothing when norender is set', async () => {
    // act
    await renderSubmit(jest.fn(), { 'ui:submitButtonOptions': { norender: true } });

    // assert
    expect(screen.queryByText('Submit')).toBeNull();
    expect(screen.queryByRole('button')).toBeNull();
  });

  it('override label wins over submitText', async () => {
    // act
    await renderSubmit(
      jest.fn(),
      { 'ui:submitButtonOptions': { submitText: 'Save it' } },
      {
        overrideLabel: 'Override',
      }
    );

    // assert
    expect(screen.getByText('Override')).toBeOnTheScreen();
    expect(screen.queryByText('Save it')).toBeNull();
  });

  it('empty-string override label is used as-is (?? not ||)', async () => {
    // act
    await renderSubmit(jest.fn(), undefined, { overrideLabel: '' });

    // assert
    expect(screen.queryByText('Submit')).toBeNull();
  });

  it('renders a FAB in absolute mode and submits on press', async () => {
    // arrange
    const submit = jest.fn();
    await renderSubmit(submit, { 'ui:submitButtonOptions': { submitText: 'Go' } }, { absolute: true });

    // act
    await fireEvent.press(screen.getByText('Go'));

    // assert
    expect(submit).toHaveBeenCalledTimes(1);
  });

  it('absolute mode keeps an empty-string override label (no "Submit" fallback for empty string)', async () => {
    // act
    await renderSubmit(jest.fn(), undefined, { absolute: true, overrideLabel: '' });

    // assert
    expect(screen.queryByText('Submit')).toBeNull();
  });

  it('absolute mode with norender renders nothing', async () => {
    // act
    await renderSubmit(jest.fn(), { 'ui:submitButtonOptions': { norender: true } }, { absolute: true });

    // assert
    expect(screen.queryByText('Submit')).toBeNull();
  });

  it('forwards ui:submitButtonOptions.props (disabled) to the button', async () => {
    // arrange
    const submit = jest.fn();
    await renderSubmit(submit, { 'ui:submitButtonOptions': { props: { disabled: true } } });

    // act
    await fireEvent.press(screen.getByText('Submit'));

    // assert
    expect(submit).not.toHaveBeenCalled();
  });
});
