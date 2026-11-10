import { NumberWidget } from '@lib/rjsf';
import { fireEvent, screen } from '@testing-library/react-native';
import { Platform } from 'react-native';
import { getTextInput, renderWidget } from './render-widget';

const NUMBER_SCHEMA = { type: 'number' } as const;
const INTEGER_SCHEMA = { type: 'integer' } as const;

describe('NumberWidget', () => {
  it('renders the required label', async () => {
    // act
    await renderWidget(NumberWidget, { label: 'Depth', required: true, schema: NUMBER_SCHEMA });

    // assert
    expect(screen.getAllByText('Depth *')).not.toHaveLength(0);
  });

  it.each`
    value        | expected
    ${12.5}      | ${'12.5'}
    ${0}         | ${'0'}
    ${-3}        | ${'-3'}
    ${undefined} | ${''}
    ${null}      | ${''}
    ${'7'}       | ${'7'}
  `('renders value $value as "$expected"', async ({ value, expected }) => {
    // act
    await renderWidget(NumberWidget, { value, schema: NUMBER_SCHEMA });

    // assert
    expect(getTextInput().props.value).toBe(expected);
  });

  it.each`
    text       | expected
    ${'12'}    | ${12}
    ${'1.5'}   | ${1.5}
    ${'1,5'}   | ${1.5}
    ${'-2.25'} | ${-2.25}
    ${'1.'}    | ${1}
    ${'.5'}    | ${0.5}
    ${'007'}   | ${7}
  `('number schema: typing "$text" emits $expected and shows the raw text', async ({ text, expected }) => {
    // arrange
    const { props } = await renderWidget(NumberWidget, { schema: NUMBER_SCHEMA });

    // act
    await fireEvent.changeText(getTextInput(), text);

    // assert
    expect(props.onChange).toHaveBeenCalledWith(expected);
    expect(getTextInput().props.value).toBe(text);
  });

  it.each`
    text   | emptyValue
    ${''}  | ${undefined}
    ${'-'} | ${undefined}
    ${'.'} | ${undefined}
    ${','} | ${undefined}
    ${''}  | ${0}
    ${'-'} | ${null}
  `(
    'number schema: digitless "$text" emits emptyValue $emptyValue and keeps the text',
    async ({ text, emptyValue }) => {
      // arrange
      const { props } = await renderWidget(NumberWidget, { value: 5, schema: NUMBER_SCHEMA, options: { emptyValue } });

      // act
      await fireEvent.changeText(getTextInput(), text);

      // assert
      expect(props.onChange).toHaveBeenCalledTimes(1);
      expect(props.onChange).toHaveBeenCalledWith(emptyValue);
      expect(getTextInput().props.value).toBe(text);
    }
  );

  it.each`
    text
    ${'1.2.3'}
    ${'abc'}
    ${'1e5'}
    ${'  '}
    ${' 1'}
    ${'1-'}
    ${'--1'}
    ${'1.,2'}
  `('number schema: rejects keystroke producing "$text"', async ({ text }) => {
    // arrange
    const { props } = await renderWidget(NumberWidget, { value: 4, schema: NUMBER_SCHEMA });

    // act
    await fireEvent.changeText(getTextInput(), text);

    // assert
    expect(props.onChange).not.toHaveBeenCalled();
    expect(getTextInput().props.value).toBe('4');
  });

  it.each`
    text    | expected
    ${'12'} | ${12}
    ${'-3'} | ${-3}
    ${'0'}  | ${0}
  `('integer schema: typing "$text" emits $expected', async ({ text, expected }) => {
    // arrange
    const { props } = await renderWidget(NumberWidget, { schema: INTEGER_SCHEMA });

    // act
    await fireEvent.changeText(getTextInput(), text);

    // assert
    expect(props.onChange).toHaveBeenCalledWith(expected);
  });

  it.each`
    text
    ${'1.5'}
    ${'1,5'}
    ${'1.'}
  `('integer schema: rejects decimal "$text"', async ({ text }) => {
    // arrange
    const { props } = await renderWidget(NumberWidget, { schema: INTEGER_SCHEMA });

    // act
    await fireEvent.changeText(getTextInput(), text);

    // assert
    expect(props.onChange).not.toHaveBeenCalled();
    expect(getTextInput().props.value).toBe('');
  });

  it('syncs the displayed text from a new external value while not focused', async () => {
    // arrange
    const { rerenderWidget } = await renderWidget(NumberWidget, { value: 1, schema: NUMBER_SCHEMA });

    // act
    await rerenderWidget({ value: 7 });

    // assert
    expect(getTextInput().props.value).toBe('7');
  });

  it('keeps the typed text while focused even when the external value changes', async () => {
    // arrange
    const { rerenderWidget } = await renderWidget(NumberWidget, { value: 1, schema: NUMBER_SCHEMA });
    await fireEvent(getTextInput(), 'focus');
    await fireEvent.changeText(getTextInput(), '1.');

    // act
    await rerenderWidget({ value: 1.5 });

    // assert
    expect(getTextInput().props.value).toBe('1.');
  });

  it('does not re-sync on blur until the external value changes again', async () => {
    // arrange
    const { rerenderWidget } = await renderWidget(NumberWidget, { value: 1, schema: NUMBER_SCHEMA });
    await fireEvent(getTextInput(), 'focus');
    await fireEvent.changeText(getTextInput(), '1.');
    await rerenderWidget({ value: 1 });

    // act
    await fireEvent(getTextInput(), 'blur');

    // assert
    expect(getTextInput().props.value).toBe('1.');

    // act
    await rerenderWidget({ value: 3 });

    // assert
    expect(getTextInput().props.value).toBe('3');
  });

  it('calls onFocus and onBlur with the id and the external value', async () => {
    // arrange
    const { props } = await renderWidget(NumberWidget, { id: 'root_depth', value: 2, schema: NUMBER_SCHEMA });

    // act
    await fireEvent(getTextInput(), 'focus');
    await fireEvent.changeText(getTextInput(), '25');
    await fireEvent(getTextInput(), 'blur');

    // assert
    expect(props.onFocus).toHaveBeenCalledWith('root_depth', 2);
    expect(props.onBlur).toHaveBeenCalledWith('root_depth', 2);
  });

  it('emits through onChange for a nested (non top-level) field id too', async () => {
    // arrange
    const { props } = await renderWidget(NumberWidget, {
      id: 'root_group_depth',
      name: 'depth',
      schema: NUMBER_SCHEMA,
    });

    // act
    await fireEvent.changeText(getTextInput(), '9');

    // assert
    expect(props.onChange).toHaveBeenCalledWith(9);
  });

  it('shows the unit affix', async () => {
    // act
    await renderWidget(NumberWidget, { schema: NUMBER_SCHEMA, options: { unit: 'kg' } });

    // assert
    expect(screen.getByText('kg')).toBeOnTheScreen();
  });

  it.each`
    disabled | readonly | editable
    ${false} | ${false} | ${true}
    ${true}  | ${false} | ${false}
    ${false} | ${true}  | ${false}
  `('editable=$editable when disabled=$disabled readonly=$readonly', async ({ disabled, readonly, editable }) => {
    // act
    await renderWidget(NumberWidget, { schema: NUMBER_SCHEMA, disabled, readonly });

    // assert
    expect(getTextInput().props.editable).toBe(editable);
  });

  it.each`
    os           | keyboardType
    ${'ios'}     | ${'numbers-and-punctuation'}
    ${'android'} | ${'numeric'}
  `('uses the signed keyboard "$keyboardType" on $os with no inputMode', async ({ os, keyboardType }) => {
    // arrange
    jest.replaceProperty(Platform, 'OS', os);

    // act
    await renderWidget(NumberWidget, { schema: NUMBER_SCHEMA });

    // assert
    expect(getTextInput().props.keyboardType).toBe(keyboardType);
    expect(getTextInput().props.inputMode).toBeUndefined();
  });

  it('forwards the placeholder', async () => {
    // act
    await renderWidget(NumberWidget, { schema: NUMBER_SCHEMA, placeholder: '0.0' });

    // assert
    expect(getTextInput().props.placeholder).toBe('0.0');
  });
});
