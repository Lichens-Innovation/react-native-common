import { PasswordWidget, TextareaWidget, TextWidget } from '@lib/rjsf';
import type { WidgetProps } from '@rjsf/utils';
import { fireEvent, screen } from '@testing-library/react-native';
import type { ComponentType } from 'react';
import { getTextInput, renderWidget } from './render-widget';

const TEXT_ENTRY_WIDGETS: [string, ComponentType<WidgetProps>][] = [
  ['TextWidget', TextWidget],
  ['TextareaWidget', TextareaWidget],
  ['PasswordWidget', PasswordWidget],
];

describe.each(TEXT_ENTRY_WIDGETS)('%s (shared text entry behaviour)', (_name, Widget) => {
  it('appends " *" to the label when required', async () => {
    // act
    await renderWidget(Widget, { label: 'Name', required: true });

    // assert
    expect(screen.getAllByText('Name *')).not.toHaveLength(0);
  });

  it('shows the plain label when not required', async () => {
    // act
    await renderWidget(Widget, { label: 'Name' });

    // assert
    expect(screen.getAllByText('Name')).not.toHaveLength(0);
  });

  it.each`
    value        | expected
    ${'abc'}     | ${'abc'}
    ${42}        | ${'42'}
    ${0}         | ${'0'}
    ${false}     | ${'false'}
    ${undefined} | ${''}
    ${null}      | ${''}
  `('renders value $value as "$expected"', async ({ value, expected }) => {
    // act
    await renderWidget(Widget, { value });

    // assert
    expect(getTextInput().props.value).toBe(expected);
  });

  it('forwards the placeholder to the native input', async () => {
    // act
    await renderWidget(Widget, { placeholder: 'Type here' });

    // assert
    expect(getTextInput().props.placeholder).toBe('Type here');
  });

  it.each`
    text     | emptyValue   | expected
    ${'abc'} | ${undefined} | ${'abc'}
    ${''}    | ${undefined} | ${undefined}
    ${''}    | ${'EMPTY'}   | ${'EMPTY'}
    ${''}    | ${null}      | ${null}
    ${'  '}  | ${'EMPTY'}   | ${'  '}
    ${' a '} | ${undefined} | ${' a '}
  `(
    'onChange receives $expected when typing "$text" (emptyValue $emptyValue)',
    async ({ text, emptyValue, expected }) => {
      // arrange
      const { props } = await renderWidget(Widget, { value: 'old', options: { emptyValue } });

      // act
      await fireEvent.changeText(getTextInput(), text);

      // assert
      expect(props.onChange).toHaveBeenCalledTimes(1);
      expect(props.onChange).toHaveBeenCalledWith(expected);
      expect(props.onBlur).not.toHaveBeenCalled();
    }
  );

  it('calls onFocus and onBlur with the widget id and current value', async () => {
    // arrange
    const { props } = await renderWidget(Widget, { id: 'root_name', value: 'v1' });

    // act
    await fireEvent(getTextInput(), 'focus');
    await fireEvent(getTextInput(), 'blur');

    // assert
    expect(props.onFocus).toHaveBeenCalledWith('root_name', 'v1');
    expect(props.onBlur).toHaveBeenCalledWith('root_name', 'v1');
  });

  it('is editable by default', async () => {
    // act
    await renderWidget(Widget);

    // assert
    expect(getTextInput().props.editable).toBe(true);
  });

  it.each`
    disabled | readonly
    ${true}  | ${false}
    ${false} | ${true}
    ${true}  | ${true}
  `('is not editable when disabled=$disabled readonly=$readonly', async ({ disabled, readonly }) => {
    // act
    await renderWidget(Widget, { disabled, readonly });

    // assert
    expect(getTextInput().props.editable).toBe(false);
  });
});

describe.each([
  ['TextWidget', TextWidget],
  ['TextareaWidget', TextareaWidget],
] as [string, ComponentType<WidgetProps>][])('%s (label hiding)', (_name, Widget) => {
  it.each`
    label        | hideLabel
    ${'Name'}    | ${true}
    ${''}        | ${false}
    ${'   '}     | ${false}
    ${undefined} | ${false}
  `('renders no label for label="$label" hideLabel=$hideLabel', async ({ label, hideLabel }) => {
    // act
    await renderWidget(Widget, { label, hideLabel, required: true });

    // assert
    expect(screen.queryAllByText(/Name|\*/u)).toHaveLength(0);
  });

  it('clear button resets to emptyValue', async () => {
    // arrange
    const { props } = await renderWidget(Widget, { value: 'abc', options: { emptyValue: 'EMPTY' } });

    // act
    await fireEvent.press(screen.getByLabelText('common:close'));

    // assert
    expect(props.onChange).toHaveBeenCalledWith('EMPTY');
  });

  it.each`
    value    | readonly | disabled
    ${''}    | ${false} | ${false}
    ${'   '} | ${false} | ${false}
    ${'abc'} | ${true}  | ${false}
  `('clear button is disabled for value "$value" readonly=$readonly', async ({ value, readonly, disabled }) => {
    // arrange
    const { props } = await renderWidget(Widget, { value, readonly, disabled });

    // act
    await fireEvent.press(screen.getByLabelText('common:close'));

    // assert
    expect(screen.getByLabelText('common:close')).toBeDisabled();
    expect(props.onChange).not.toHaveBeenCalled();
  });
});

describe.each([
  ['TextWidget', TextWidget],
  ['TextareaWidget', TextareaWidget],
] as [string, ComponentType<WidgetProps>][])('%s (dictation input)', (_name, Widget) => {
  it('renders a whitespace-only value as an empty input', async () => {
    // act
    await renderWidget(Widget, { value: '   ' });

    // assert
    expect(getTextInput().props.value).toBe('');
  });

  it('renders a value with surrounding spaces untouched', async () => {
    // act
    await renderWidget(Widget, { value: ' a ' });

    // assert
    expect(getTextInput().props.value).toBe(' a ');
  });
});

describe('TextWidget', () => {
  it('is single-line', async () => {
    // act
    await renderWidget(TextWidget);

    // assert
    expect(getTextInput().props.multiline).toBeFalsy();
  });
});

describe('TextareaWidget', () => {
  it.each`
    numberOfLines | expected
    ${undefined}  | ${4}
    ${6}          | ${6}
    ${0}          | ${0}
  `('is multiline with numberOfLines=$expected (option $numberOfLines)', async ({ numberOfLines, expected }) => {
    // act
    await renderWidget(TextareaWidget, { options: { numberOfLines } });

    // assert
    expect(getTextInput().props.multiline).toBe(true);
    expect(getTextInput().props.numberOfLines).toBe(expected);
  });
});

describe('PasswordWidget', () => {
  it('falls back to the translated "password" label when the label is hidden', async () => {
    // act
    await renderWidget(PasswordWidget, { label: 'Secret', hideLabel: true });

    // assert
    expect(screen.getAllByText('common:password')).not.toHaveLength(0);
  });

  it.each`
    label
    ${''}
    ${'   '}
    ${undefined}
  `('falls back to the translated label for blank label $label', async ({ label }) => {
    // act
    await renderWidget(PasswordWidget, { label });

    // assert
    expect(screen.getAllByText('common:password')).not.toHaveLength(0);
  });

  it('masks the value until the eye icon is pressed', async () => {
    // arrange
    await renderWidget(PasswordWidget, { value: 'secret' });
    expect(getTextInput().props.secureTextEntry).toBe(true);

    // act
    await fireEvent.press(screen.getByLabelText('common:passwordInput.showPassword'));

    // assert
    expect(getTextInput().props.secureTextEntry).toBe(false);
    expect(screen.getByLabelText('common:passwordInput.hidePassword')).toBeOnTheScreen();
  });

  it('renders a whitespace-only value as is', async () => {
    // act
    await renderWidget(PasswordWidget, { value: '   ' });

    // assert
    expect(getTextInput().props.value).toBe('   ');
  });

  it('has no dictation clear button', async () => {
    // act
    await renderWidget(PasswordWidget, { value: 'secret' });

    // assert
    expect(screen.queryByLabelText('common:close')).not.toBeOnTheScreen();
  });
});
