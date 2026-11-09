import { fireEvent, screen, within } from '@testing-library/react-native';
import type { ReactNode } from 'react';
import { StyleSheet, type StyleProp, type TextStyle, type ViewStyle } from 'react-native';
import { DropDownMultiSelector, DropDownSelector, type MultiSelectOption, type SelectOption } from '@lib';
import { ICON_GLYPH, renderWithProviders, TEST_THEME } from './render-with-providers';

interface FakeDropdownItem {
  value: string;
  [field: string]: string;
}

interface FakeDropdownProps {
  data: FakeDropdownItem[];
  value?: string | string[];
  placeholder?: string;
  labelField: string;
  disable?: boolean;
  mode?: string;
  style?: StyleProp<ViewStyle>;
  containerStyle?: StyleProp<ViewStyle>;
  selectedTextStyle?: StyleProp<TextStyle>;
  placeholderStyle?: StyleProp<TextStyle>;
  renderItem: (item: FakeDropdownItem, selected: boolean) => ReactNode;
  renderLeftIcon?: () => ReactNode;
  onFocus?: () => void;
  onBlur?: () => void;
  onChange: (selection: FakeDropdownItem | string[]) => void;
}

interface FakeSelectorProps extends FakeDropdownProps {
  isMulti: boolean;
}

/** habit-hooks-disable non-essential-comment
 * react-native-element-dropdown cannot open its list under Jest (measureInWindow never calls back).
 * This fake keeps the library contract (props in, callbacks out) and renders what the selector hands to it.
 */
jest.mock('react-native-element-dropdown', () => {
  const { Pressable, Text, View } = jest.requireActual<typeof import('react-native')>('react-native');

  const FakeSelector = ({
    isMulti,
    data,
    value,
    placeholder,
    labelField,
    disable,
    mode,
    style,
    containerStyle,
    selectedTextStyle,
    placeholderStyle,
    renderItem,
    renderLeftIcon,
    onFocus,
    onBlur,
    onChange,
  }: FakeSelectorProps) => {
    const multiValue = Array.isArray(value) ? value : [];
    const isSelected = (item: FakeDropdownItem) => (isMulti ? multiValue.includes(item.value) : item.value === value);
    const selectedLabels = data.filter(isSelected).map((item) => item[labelField]);
    const leftIcon = renderLeftIcon?.();
    const renderedOptions = data.map((item) => ({ item, node: renderItem(item, isSelected(item)) }));

    const handleOptionPress = (item: FakeDropdownItem) => {
      if (isMulti) {
        onChange(
          multiValue.includes(item.value) ? multiValue.filter((v) => v !== item.value) : [...multiValue, item.value]
        );
      } else {
        onChange(item);
      }
    };

    return (
      <View accessibilityLabel="dropdown" style={style} accessibilityState={{ disabled: !!disable }}>
        <View accessibilityLabel="dropdown-left-icon">{leftIcon}</View>
        <Text
          accessibilityLabel="dropdown-text"
          style={selectedLabels.length && !isMulti ? selectedTextStyle : placeholderStyle}
        >
          {!isMulti && selectedLabels.length ? selectedLabels[0] : placeholder}
        </Text>
        <Text accessibilityLabel="dropdown-mode">{String(mode ?? 'none')}</Text>
        <Text accessibilityLabel="dropdown-container-style">{JSON.stringify(containerStyle ?? null)}</Text>
        <Pressable accessibilityLabel="dropdown-focus" onPress={() => onFocus?.()} />
        <Pressable accessibilityLabel="dropdown-blur" onPress={() => onBlur?.()} />
        {renderedOptions.map(({ item, node }) => (
          <Pressable
            key={item.value}
            accessibilityLabel={`option-${item.value}`}
            onPress={() => handleOptionPress(item)}
          >
            <View accessibilityLabel={`rendered-option-${item.value}`}>{node}</View>
          </Pressable>
        ))}
      </View>
    );
  };

  return {
    Dropdown: (props: FakeDropdownProps) => <FakeSelector {...props} isMulti={false} />,
    MultiSelect: (props: FakeDropdownProps) => <FakeSelector {...props} isMulti />,
  };
});

const { colors } = TEST_THEME;

const OPTIONS: SelectOption[] = [
  { label: 'Apple', value: 'apple', icon: 'food-apple' },
  { label: 'Banana', value: 'banana' },
  { label: 'Cherry', value: 'cherry', icon: '   ' },
];

const flatStyle = (label: string) => StyleSheet.flatten(screen.getByLabelText(label).props.style);

const iconCountWithin = (label: string) =>
  within(screen.getByLabelText(label, { includeHiddenElements: true })).queryAllByText(ICON_GLYPH, {
    includeHiddenElements: true,
  }).length;

describe('DropDownSelector', () => {
  const renderSelector = (props: Partial<Parameters<typeof DropDownSelector>[0]> = {}) => {
    const onChange = jest.fn();
    const utils = renderWithProviders(<DropDownSelector options={OPTIONS} onChange={onChange} {...props} />);
    return { onChange, utils };
  };

  it('renders the label above the field when provided', async () => {
    // act
    await renderSelector({ label: 'Fruit' }).utils;

    // assert
    expect(screen.getByText('Fruit')).toBeOnTheScreen();
  });

  it.each`
    label        | description
    ${undefined} | ${'undefined'}
    ${''}        | ${'empty string'}
  `('does not render a label for $description', async ({ label }) => {
    // act
    await renderSelector({ label, placeholder: 'Pick one' }).utils;

    // assert
    expect(screen.queryAllByText('', { exact: true, normalizer: (text) => text })).toHaveLength(0);
  });

  it('treats whitespace-only label as set (renders the whitespace title)', async () => {
    // arrange
    await renderSelector({ label: '   ' }).utils;

    // act
    const whitespaceTitles = screen.queryAllByText('   ', { exact: true, normalizer: (text) => text });

    // assert
    expect(whitespaceTitles).toHaveLength(1);
  });

  it('shows the placeholder when no value is selected', async () => {
    // act
    await renderSelector({ placeholder: 'Pick one' }).utils;

    // assert
    expect(screen.getByLabelText('dropdown-text')).toHaveTextContent('Pick one');
  });

  it('shows the selected option label', async () => {
    // act
    await renderSelector({ value: 'banana', placeholder: 'Pick one' }).utils;

    // assert
    expect(screen.getByLabelText('dropdown-text')).toHaveTextContent('Banana');
  });

  it('clears the placeholder while focused and restores it on blur', async () => {
    // arrange
    await renderSelector({ placeholder: 'Pick one' }).utils;

    // act
    await fireEvent.press(screen.getByLabelText('dropdown-focus'));

    // assert
    expect(screen.getByLabelText('dropdown-text')).toHaveTextContent('');

    // act
    await fireEvent.press(screen.getByLabelText('dropdown-blur'));

    // assert
    expect(screen.getByLabelText('dropdown-text')).toHaveTextContent('Pick one');
  });

  it('calls onChange with the option value and leaves the focused state', async () => {
    // arrange
    const { onChange, utils } = renderSelector({ placeholder: 'Pick one', label: 'Fruit' });
    await utils;
    await fireEvent.press(screen.getByLabelText('dropdown-focus'));

    // act
    await fireEvent.press(screen.getByLabelText('option-cherry'));

    // assert
    expect(onChange).toHaveBeenCalledTimes(1);
    expect(onChange).toHaveBeenCalledWith('cherry');
    expect(StyleSheet.flatten(screen.getByText('Fruit').props.style).color).toBe(colors.onSurface);
  });

  it('forwards the disabled flag to the dropdown', async () => {
    // act
    await renderSelector({ disabled: true }).utils;

    // assert
    expect(screen.getByLabelText('dropdown')).toBeDisabled();
  });

  it('passes no container style shift on iOS', async () => {
    // act
    await renderSelector().utils;

    // assert
    expect(screen.getByLabelText('dropdown-container-style')).toHaveTextContent('null');
  });

  describe('clear button', () => {
    it.each`
      showDeleteButton | value        | disabled     | isVisible | description
      ${false}         | ${'apple'}   | ${false}     | ${false}  | ${'hidden when showDeleteButton is false (default)'}
      ${true}          | ${'apple'}   | ${false}     | ${true}   | ${'visible with a value'}
      ${true}          | ${'apple'}   | ${undefined} | ${true}   | ${'visible with a value and disabled undefined'}
      ${true}          | ${'apple'}   | ${true}      | ${false}  | ${'hidden when disabled'}
      ${true}          | ${undefined} | ${false}     | ${false}  | ${'hidden when value is undefined'}
      ${true}          | ${''}        | ${false}     | ${false}  | ${'hidden when value is empty'}
      ${true}          | ${'   '}     | ${false}     | ${true}   | ${'visible when value is whitespace-only (truthy check)'}
    `('is $description', async ({ showDeleteButton, value, disabled, isVisible }) => {
      // act
      await renderSelector({ showDeleteButton, value, disabled }).utils;

      // assert
      expect(screen.queryAllByRole('button')).toHaveLength(isVisible ? 1 : 0);
    });

    it('calls onChange with an empty string when pressed', async () => {
      // arrange
      const { onChange, utils } = renderSelector({ showDeleteButton: true, value: 'apple' });
      await utils;

      // act
      await fireEvent.press(screen.getByRole('button'));

      // assert
      expect(onChange).toHaveBeenCalledWith('');
    });
  });

  describe('icons', () => {
    it('renders the left icon of the selected option', async () => {
      // act
      await renderSelector({ value: 'apple' }).utils;

      // assert
      expect(iconCountWithin('dropdown-left-icon')).toBe(1);
    });

    it('renders no left icon when the selected option has none', async () => {
      // act
      await renderSelector({ value: 'banana' }).utils;

      // assert
      expect(iconCountWithin('dropdown-left-icon')).toBe(0);
    });

    it('treats whitespace-only selected icon as set (renders the left icon)', async () => {
      // act
      await renderSelector({ value: 'cherry' }).utils;

      // assert
      expect(iconCountWithin('dropdown-left-icon')).toBe(1);
    });

    it.each`
      value       | expectedIcons | description
      ${'apple'}  | ${1}          | ${'an icon'}
      ${'banana'} | ${0}          | ${'no icon'}
      ${'cherry'} | ${1}          | ${'a whitespace-only icon (treated as set)'}
    `('renders list item icon for an option with $description', async ({ value, expectedIcons }) => {
      // act
      await renderSelector().utils;

      // assert
      expect(iconCountWithin(`rendered-option-${value}`)).toBe(expectedIcons);
    });

    it('renders every option label in the list', async () => {
      // act
      await renderSelector().utils;

      // assert
      OPTIONS.forEach(({ label }) =>
        expect(screen.getByLabelText(`rendered-option-${label.toLowerCase()}`)).toHaveTextContent(
          new RegExp(`${label}$`)
        )
      );
    });
  });

  describe('colors', () => {
    it.each`
      isError  | disabled | focused  | labelColor   | expectedLabel               | expectedBorder            | expectedBorderWidth | description
      ${false} | ${false} | ${false} | ${undefined} | ${colors.onSurface}         | ${colors.outline}         | ${1}                | ${'resting'}
      ${false} | ${false} | ${true}  | ${undefined} | ${colors.primary}           | ${colors.primary}         | ${2}                | ${'focused'}
      ${true}  | ${false} | ${false} | ${undefined} | ${colors.error}             | ${colors.error}           | ${1}                | ${'error'}
      ${true}  | ${false} | ${true}  | ${undefined} | ${colors.error}             | ${colors.error}           | ${2}                | ${'error while focused'}
      ${false} | ${true}  | ${false} | ${undefined} | ${colors.onSurfaceDisabled} | ${colors.surfaceDisabled} | ${1}                | ${'disabled'}
      ${true}  | ${true}  | ${false} | ${undefined} | ${colors.error}             | ${colors.error}           | ${1}                | ${'error wins over disabled'}
      ${false} | ${false} | ${false} | ${'#123456'} | ${'#123456'}                | ${colors.outline}         | ${1}                | ${'labelColor override at rest'}
      ${false} | ${false} | ${true}  | ${'#123456'} | ${'#123456'}                | ${colors.primary}         | ${2}                | ${'labelColor override wins over focus'}
      ${true}  | ${false} | ${false} | ${'#123456'} | ${colors.error}             | ${colors.error}           | ${1}                | ${'labelColor override ignored in error'}
      ${false} | ${true}  | ${false} | ${'#123456'} | ${colors.onSurfaceDisabled} | ${colors.surfaceDisabled} | ${1}                | ${'labelColor override ignored when disabled'}
      ${false} | ${false} | ${false} | ${''}        | ${colors.onSurface}         | ${colors.outline}         | ${1}                | ${'empty labelColor falls back'}
      ${false} | ${false} | ${false} | ${'   '}     | ${'   '}                    | ${colors.outline}         | ${1}                | ${'whitespace-only labelColor is used as-is'}
    `(
      'applies label/border colors when $description',
      async ({ isError, disabled, focused, labelColor, expectedLabel, expectedBorder, expectedBorderWidth }) => {
        // arrange
        await renderSelector({ label: 'Fruit', isError, disabled, labelColor }).utils;

        // act
        if (focused) await fireEvent.press(screen.getByLabelText('dropdown-focus'));

        // assert
        expect(StyleSheet.flatten(screen.getByText('Fruit').props.style).color).toBe(expectedLabel);
        const dropdownStyle = flatStyle('dropdown');
        expect(dropdownStyle.borderColor).toBe(expectedBorder);
        expect(dropdownStyle.borderWidth).toBe(expectedBorderWidth);
      }
    );

    it.each`
      disabled | disabledTransparentBackground | expected
      ${false} | ${false}                      | ${'transparent'}
      ${false} | ${true}                       | ${'transparent'}
      ${true}  | ${false}                      | ${colors.surfaceDisabled}
      ${true}  | ${true}                       | ${'transparent'}
    `(
      'uses background $expected when disabled=$disabled and disabledTransparentBackground=$disabledTransparentBackground',
      async ({ disabled, disabledTransparentBackground, expected }) => {
        // act
        await renderSelector({ disabled, disabledTransparentBackground }).utils;

        // assert
        expect(flatStyle('dropdown').backgroundColor).toBe(expected);
      }
    );

    it.each`
      disabled | focused  | expected
      ${false} | ${false} | ${colors.secondary}
      ${false} | ${true}  | ${colors.primary}
      ${true}  | ${false} | ${colors.onSurfaceDisabled}
      ${true}  | ${true}  | ${colors.onSurfaceDisabled}
    `('uses text color $expected when disabled=$disabled focused=$focused', async ({ disabled, focused, expected }) => {
      // arrange
      await renderSelector({ disabled, placeholder: 'Pick one' }).utils;

      // act
      if (focused) await fireEvent.press(screen.getByLabelText('dropdown-focus'));

      // assert
      expect(StyleSheet.flatten(screen.getByLabelText('dropdown-text').props.style).color).toBe(expected);
    });

    it('pins the single dropdown field style', async () => {
      // act
      await renderSelector().utils;

      // assert
      expect(flatStyle('dropdown')).toEqual({
        height: 50,
        borderColor: colors.outline,
        borderWidth: 1,
        borderRadius: TEST_THEME.roundness,
        paddingHorizontal: 8,
        backgroundColor: 'transparent',
      });
    });
  });
});

describe('DropDownMultiSelector', () => {
  const MULTI_OPTIONS: MultiSelectOption[] = OPTIONS;

  const renderMulti = (props: Partial<Parameters<typeof DropDownMultiSelector>[0]> = {}) => {
    const onChange = jest.fn();
    const utils = renderWithProviders(<DropDownMultiSelector options={MULTI_OPTIONS} onChange={onChange} {...props} />);
    return { onChange, utils };
  };

  it('renders the label when provided', async () => {
    // act
    await renderMulti({ label: 'Fruits' }).utils;

    // assert
    expect(screen.getByText('Fruits')).toBeOnTheScreen();
  });

  it('treats whitespace-only label as set (renders the whitespace title)', async () => {
    // act
    await renderMulti({ label: '  ' }).utils;

    // assert
    expect(screen.queryAllByText('  ', { exact: true, normalizer: (text) => text })).toHaveLength(1);
  });

  it('shows the placeholder and clears it while focused', async () => {
    // arrange
    await renderMulti({ placeholder: 'Pick some' }).utils;
    expect(screen.getByLabelText('dropdown-text')).toHaveTextContent('Pick some');

    // act
    await fireEvent.press(screen.getByLabelText('dropdown-focus'));

    // assert
    expect(screen.getByLabelText('dropdown-text')).toHaveTextContent('');
  });

  it('calls onChange with the full list of selected values', async () => {
    // arrange
    const { onChange, utils } = renderMulti({ value: ['apple'] });
    await utils;

    // act
    await fireEvent.press(screen.getByLabelText('option-banana'));

    // assert
    expect(onChange).toHaveBeenCalledWith(['apple', 'banana']);
  });

  it.each`
    modal        | expectedMode
    ${undefined} | ${'default'}
    ${false}     | ${'default'}
    ${true}      | ${'modal'}
  `('uses dropdown mode $expectedMode when modal=$modal', async ({ modal, expectedMode }) => {
    // act
    await renderMulti({ modal }).utils;

    // assert
    expect(screen.getByLabelText('dropdown-mode')).toHaveTextContent(expectedMode);
  });

  describe('clear button', () => {
    it.each`
      showDeleteButton | value                  | disabled | isVisible | description
      ${false}         | ${['apple']}           | ${false} | ${false}  | ${'hidden by default'}
      ${true}          | ${['apple']}           | ${false} | ${true}   | ${'visible with a selection'}
      ${true}          | ${['apple', 'banana']} | ${true}  | ${false}  | ${'hidden when disabled'}
      ${true}          | ${[]}                  | ${false} | ${false}  | ${'hidden with an empty selection'}
      ${true}          | ${undefined}           | ${false} | ${false}  | ${'hidden when value is undefined'}
      ${true}          | ${['']}                | ${false} | ${true}   | ${'visible with a selection holding an empty string'}
    `('is $description', async ({ showDeleteButton, value, disabled, isVisible }) => {
      // act
      await renderMulti({ showDeleteButton, value, disabled }).utils;

      // assert
      expect(screen.queryAllByRole('button')).toHaveLength(isVisible ? 1 : 0);
    });

    it('calls onChange with an empty array when pressed', async () => {
      // arrange
      const { onChange, utils } = renderMulti({ showDeleteButton: true, value: ['apple'] });
      await utils;

      // act
      await fireEvent.press(screen.getByRole('button'));

      // assert
      expect(onChange).toHaveBeenCalledWith([]);
    });
  });

  it.each`
    value                  | expectedIcons | description
    ${['banana', 'apple']} | ${1}          | ${'first option (in options order) with a selected value: apple'}
    ${['banana']}          | ${0}          | ${'selected option without icon'}
    ${['cherry']}          | ${1}          | ${'selected option with whitespace-only icon (treated as set)'}
    ${undefined}           | ${0}          | ${'no selection'}
  `('renders the left icon of the $description', async ({ value, expectedIcons }) => {
    // act
    await renderMulti({ value }).utils;

    // assert
    expect(iconCountWithin('dropdown-left-icon')).toBe(expectedIcons);
  });

  it('pins the multi dropdown field style (adds a bottom margin)', async () => {
    // act
    await renderMulti().utils;

    // assert
    expect(flatStyle('dropdown')).toEqual({
      height: 50,
      borderColor: colors.outline,
      borderWidth: 1,
      borderRadius: TEST_THEME.roundness,
      paddingHorizontal: 8,
      marginBottom: 8,
      backgroundColor: 'transparent',
    });
  });

  it.each`
    isError  | disabled | labelColor   | expectedLabel
    ${false} | ${false} | ${undefined} | ${colors.onSurface}
    ${true}  | ${false} | ${'#123456'} | ${colors.error}
    ${false} | ${true}  | ${undefined} | ${colors.onSurfaceDisabled}
    ${false} | ${false} | ${'#123456'} | ${'#123456'}
  `(
    'uses label color $expectedLabel (isError=$isError disabled=$disabled labelColor=$labelColor)',
    async ({ isError, disabled, labelColor, expectedLabel }) => {
      // act
      await renderMulti({ label: 'Fruits', isError, disabled, labelColor }).utils;

      // assert
      expect(StyleSheet.flatten(screen.getByText('Fruits').props.style).color).toBe(expectedLabel);
    }
  );
});
