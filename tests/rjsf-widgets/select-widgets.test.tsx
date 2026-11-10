jest.mock('react-native-element-dropdown', () => {
  const { View } = jest.requireActual<typeof import('react-native')>('react-native');
  const MockDropdown = (props: object) => <View {...props} accessibilityLabel="mock-dropdown" />;
  const MockMultiSelect = (props: object) => <View {...props} accessibilityLabel="mock-multi-select" />;
  return { __esModule: true, Dropdown: MockDropdown, MultiSelect: MockMultiSelect };
});

import { MultiSelectWidget, SelectWidget } from '@lib/rjsf';
import { fireEvent, screen } from '@testing-library/react-native';
import { renderWidget } from './render-widget';

const ENUM_OPTIONS = [
  { value: 'a', label: 'Alpha' },
  { value: 'b', label: 'Beta' },
  { value: 1, label: 'One' },
];

const getDropdown = () => screen.getByLabelText('mock-dropdown');
const getMultiSelect = () => screen.getByLabelText('mock-multi-select');

describe('SelectWidget', () => {
  it('renders the required label above the dropdown', async () => {
    // act
    await renderWidget(SelectWidget, { label: 'Kind', required: true, options: { enumOptions: ENUM_OPTIONS } });

    // assert
    expect(screen.getByText('Kind *')).toBeOnTheScreen();
  });

  it.each`
    label        | hideLabel
    ${'Kind'}    | ${true}
    ${'   '}     | ${false}
    ${''}        | ${false}
    ${undefined} | ${false}
  `('renders no label for label="$label" hideLabel=$hideLabel', async ({ label, hideLabel }) => {
    // act
    await renderWidget(SelectWidget, { label, hideLabel, required: true, options: { enumOptions: ENUM_OPTIONS } });

    // assert
    expect(screen.queryByText(/\*/)).not.toBeOnTheScreen();
    expect(screen.queryByText('Kind')).not.toBeOnTheScreen();
  });

  it('applies a valid hex labelColor to the label', async () => {
    // act
    await renderWidget(SelectWidget, { label: 'Kind', options: { enumOptions: ENUM_OPTIONS, labelColor: '#ff0000' } });

    // assert
    expect(screen.getByText('Kind')).toHaveStyle({ color: '#ff0000' });
  });

  it('maps enumOptions to string-valued dropdown data', async () => {
    // act
    await renderWidget(SelectWidget, { options: { enumOptions: ENUM_OPTIONS } });

    // assert
    expect(getDropdown().props.data).toEqual([
      { value: 'a', label: 'Alpha' },
      { value: 'b', label: 'Beta' },
      { value: '1', label: 'One' },
    ]);
  });

  it('passes an empty list when enumOptions is missing', async () => {
    // act
    await renderWidget(SelectWidget, { options: {} });

    // assert
    expect(getDropdown().props.data).toEqual([]);
  });

  it.each`
    value        | expected
    ${'a'}       | ${'a'}
    ${1}         | ${'1'}
    ${0}         | ${'0'}
    ${''}        | ${''}
    ${undefined} | ${undefined}
    ${null}      | ${undefined}
  `('passes value $value to the dropdown as $expected', async ({ value, expected }) => {
    // act
    await renderWidget(SelectWidget, { value, options: { enumOptions: ENUM_OPTIONS } });

    // assert
    expect(getDropdown().props.value).toBe(expected);
  });

  it('forwards the placeholder as is', async () => {
    // act
    await renderWidget(SelectWidget, { placeholder: 'Pick one', options: { enumOptions: ENUM_OPTIONS } });

    // assert
    expect(getDropdown().props.placeholder).toBe('Pick one');
  });

  it('calls onChange then onBlur with the picked code', async () => {
    // arrange
    const { props } = await renderWidget(SelectWidget, { id: 'root_kind', options: { enumOptions: ENUM_OPTIONS } });

    // act
    await fireEvent(getDropdown(), 'change', { value: 'b', label: 'Beta' });

    // assert
    expect(props.onChange).toHaveBeenCalledWith('b');
    expect(props.onBlur).toHaveBeenCalledWith('root_kind', 'b');
    expect(props.onChange.mock.invocationCallOrder[0]).toBeLessThan(props.onBlur.mock.invocationCallOrder[0]);
  });

  it.each`
    disabled | readonly | disable
    ${false} | ${false} | ${false}
    ${true}  | ${false} | ${true}
    ${false} | ${true}  | ${true}
    ${true}  | ${true}  | ${true}
  `('disable=$disable when disabled=$disabled readonly=$readonly', async ({ disabled, readonly, disable }) => {
    // act
    await renderWidget(SelectWidget, { disabled, readonly, options: { enumOptions: ENUM_OPTIONS } });

    // assert
    expect(getDropdown().props.disable).toBe(disable);
  });
});

describe('MultiSelectWidget', () => {
  it('renders the required label', async () => {
    // act
    await renderWidget(MultiSelectWidget, { label: 'Tags', required: true, options: { enumOptions: ENUM_OPTIONS } });

    // assert
    expect(screen.getByText('Tags *')).toBeOnTheScreen();
  });

  it('applies a valid hex labelColor and ignores an invalid one', async () => {
    // arrange
    const { rerenderWidget } = await renderWidget(MultiSelectWidget, {
      label: 'Tags',
      options: { enumOptions: ENUM_OPTIONS, labelColor: ' #00ff00 ' },
    });

    // assert
    expect(screen.getByText('Tags')).toHaveStyle({ color: '#00ff00' });

    // act
    await rerenderWidget({ options: { enumOptions: ENUM_OPTIONS, labelColor: 'red' } });

    // assert
    expect(screen.getByText('Tags')).not.toHaveStyle({ color: 'red' });
  });

  it.each`
    value         | expected
    ${['a', 'b']} | ${['a', 'b']}
    ${[1, 'b']}   | ${['1', 'b']}
    ${[null]}     | ${['null']}
    ${[]}         | ${[]}
    ${'a'}        | ${[]}
    ${undefined}  | ${[]}
    ${null}       | ${[]}
  `('passes value $value to the multi select as $expected', async ({ value, expected }) => {
    // act
    await renderWidget(MultiSelectWidget, { value, options: { enumOptions: ENUM_OPTIONS } });

    // assert
    expect(getMultiSelect().props.value).toEqual(expected);
  });

  it.each`
    optionsPlaceholder | uiPlaceholder | placeholder  | expected
    ${'Opt'}           | ${'Ui'}       | ${'Prop'}    | ${'Opt'}
    ${undefined}       | ${'Ui'}       | ${'Prop'}    | ${'Ui'}
    ${undefined}       | ${undefined}  | ${'Prop'}    | ${'Prop'}
    ${undefined}       | ${undefined}  | ${undefined} | ${'...'}
    ${''}              | ${''}         | ${''}        | ${'...'}
    ${''}              | ${undefined}  | ${'Prop'}    | ${'Prop'}
  `(
    'resolves placeholder to "$expected" (options.placeholder=$optionsPlaceholder, ui:placeholder=$uiPlaceholder, placeholder=$placeholder)',
    async ({ optionsPlaceholder, uiPlaceholder, placeholder, expected }) => {
      // act
      await renderWidget(MultiSelectWidget, {
        placeholder,
        options: { enumOptions: ENUM_OPTIONS, placeholder: optionsPlaceholder, 'ui:placeholder': uiPlaceholder },
      });

      // assert
      expect(getMultiSelect().props.placeholder).toBe(expected);
    }
  );

  it('skips a whitespace-only options.placeholder and falls back to the next candidate', async () => {
    // act
    await renderWidget(MultiSelectWidget, {
      placeholder: 'Prop',
      options: { enumOptions: ENUM_OPTIONS, placeholder: '   ' },
    });

    // assert
    expect(getMultiSelect().props.placeholder).toBe('Prop');
  });

  it('falls back to "..." for a whitespace-only placeholder prop', async () => {
    // act
    await renderWidget(MultiSelectWidget, { placeholder: '  ', options: { enumOptions: ENUM_OPTIONS } });

    // assert
    expect(getMultiSelect().props.placeholder).toBe('...');
  });

  it('skips a non-string options.placeholder and falls back to the next candidate', async () => {
    // act
    await renderWidget(MultiSelectWidget, {
      placeholder: 'Prop',
      options: { enumOptions: ENUM_OPTIONS, placeholder: 42 as unknown as string },
    });

    // assert
    expect(getMultiSelect().props.placeholder).toBe('Prop');
  });

  it('calls onChange then onBlur with the picked codes', async () => {
    // arrange
    const { props } = await renderWidget(MultiSelectWidget, {
      id: 'root_tags',
      options: { enumOptions: ENUM_OPTIONS },
    });

    // act
    await fireEvent(getMultiSelect(), 'change', ['a', '1']);

    // assert
    expect(props.onChange).toHaveBeenCalledWith(['a', '1']);
    expect(props.onBlur).toHaveBeenCalledWith('root_tags', ['a', '1']);
  });

  it.each`
    disabled | readonly | disable
    ${false} | ${false} | ${false}
    ${true}  | ${false} | ${true}
    ${false} | ${true}  | ${true}
  `('disable=$disable when disabled=$disabled readonly=$readonly', async ({ disabled, readonly, disable }) => {
    // act
    await renderWidget(MultiSelectWidget, { disabled, readonly, options: { enumOptions: ENUM_OPTIONS } });

    // assert
    expect(getMultiSelect().props.disable).toBe(disable);
  });
});
