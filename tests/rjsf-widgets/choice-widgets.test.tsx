import { CheckboxesWidget, CheckboxWidget, RadioWidget, RadioYesNoWidget } from '@lib/rjsf';
import { fireEvent, screen } from '@testing-library/react-native';
import { renderWidget } from './render-widget';

const ENUM_OPTIONS = [
  { value: 'a', label: 'Alpha' },
  { value: 'b', label: 'Beta' },
  { value: 'c', label: 'Gamma' },
];

describe('CheckboxWidget', () => {
  it.each`
    value        | checked
    ${true}      | ${true}
    ${false}     | ${false}
    ${'true'}    | ${false}
    ${1}         | ${false}
    ${undefined} | ${false}
  `('switch is on=$checked for value $value', async ({ value, checked }) => {
    // act
    await renderWidget(CheckboxWidget, { value });

    // assert
    expect(screen.getByRole('switch').props.value).toBe(checked);
  });

  it('commits the switch value through onChange then onBlur', async () => {
    // arrange
    const { props } = await renderWidget(CheckboxWidget, { id: 'root_ok', value: false });

    // act
    await fireEvent(screen.getByRole('switch'), 'valueChange', true);

    // assert
    expect(props.onChange).toHaveBeenCalledWith(true);
    expect(props.onBlur).toHaveBeenCalledWith('root_ok', true);
  });

  it.each`
    value    | expected
    ${true}  | ${false}
    ${false} | ${true}
    ${'yes'} | ${true}
  `('pressing the label toggles value $value to $expected', async ({ value, expected }) => {
    // arrange
    const { props } = await renderWidget(CheckboxWidget, { id: 'root_ok', label: 'Accept', value });

    // act
    await fireEvent.press(screen.getByText('Accept'));

    // assert
    expect(props.onChange).toHaveBeenCalledWith(expected);
    expect(props.onBlur).toHaveBeenCalledWith('root_ok', expected);
  });

  it('renders the required label', async () => {
    // act
    await renderWidget(CheckboxWidget, { label: 'Accept', required: true });

    // assert
    expect(screen.getByText('Accept *')).toBeOnTheScreen();
  });

  it.each`
    label        | hideLabel
    ${'Accept'}  | ${true}
    ${'   '}     | ${false}
    ${''}        | ${false}
    ${undefined} | ${false}
  `('renders no label for label="$label" hideLabel=$hideLabel', async ({ label, hideLabel }) => {
    // act
    await renderWidget(CheckboxWidget, { label, hideLabel });

    // assert
    expect(screen.queryByText(/Accept/)).not.toBeOnTheScreen();
    expect(screen.getByRole('switch')).toBeOnTheScreen();
  });

  it.each`
    disabled | readonly
    ${true}  | ${false}
    ${false} | ${true}
  `('label press does nothing when disabled=$disabled readonly=$readonly', async ({ disabled, readonly }) => {
    // arrange
    const { props } = await renderWidget(CheckboxWidget, { label: 'Accept', value: false, disabled, readonly });

    // act
    await fireEvent.press(screen.getByText('Accept'));

    // assert
    expect(props.onChange).not.toHaveBeenCalled();
  });

  it('disables the switch only when disabled (not when readonly)', async () => {
    // arrange
    const { rerenderWidget } = await renderWidget(CheckboxWidget, { disabled: true });

    // assert
    expect(screen.getByRole('switch').props.disabled).toBe(true);

    // act
    await rerenderWidget({ disabled: false, readonly: true });

    // assert
    expect(screen.getByRole('switch').props.disabled).toBe(false);
  });

  it('applies the labelColor option to the label', async () => {
    // act
    await renderWidget(CheckboxWidget, { label: 'Accept', options: { labelColor: '#123456' } });

    // assert
    expect(screen.getByText('Accept')).toHaveStyle({ color: '#123456' });
  });
});

describe('CheckboxesWidget', () => {
  const getCheckbox = (index: number) => screen.getAllByRole('checkbox')[index];

  it('renders the title and one checkbox per option', async () => {
    // act
    await renderWidget(CheckboxesWidget, { label: 'Pick', required: true, options: { enumOptions: ENUM_OPTIONS } });

    // assert
    expect(screen.getByText('Pick *')).toBeOnTheScreen();
    expect(screen.getByText('Alpha')).toBeOnTheScreen();
    expect(screen.getByText('Gamma')).toBeOnTheScreen();
    expect(screen.getAllByRole('checkbox')).toHaveLength(3);
  });

  it.each`
    label
    ${''}
    ${'   '}
    ${undefined}
  `('renders no title for blank label $label', async ({ label }) => {
    // act
    await renderWidget(CheckboxesWidget, { label, required: true, options: { enumOptions: ENUM_OPTIONS } });

    // assert
    expect(screen.queryByText(/\*/)).not.toBeOnTheScreen();
  });

  it('checks the options present in the value', async () => {
    // act
    await renderWidget(CheckboxesWidget, { value: ['b'], options: { enumOptions: ENUM_OPTIONS } });

    // assert
    expect(getCheckbox(0)).not.toBeChecked();
    expect(getCheckbox(1)).toBeChecked();
  });

  it.each`
    value         | pressed    | expected
    ${['a']}      | ${'Beta'}  | ${['a', 'b']}
    ${['a', 'b']} | ${'Alpha'} | ${['b']}
    ${['a']}      | ${'Alpha'} | ${[]}
    ${undefined}  | ${'Gamma'} | ${['c']}
    ${'a'}        | ${'Alpha'} | ${['a']}
    ${['a', 'a']} | ${'Beta'}  | ${['a', 'b']}
    ${['zz']}     | ${'Alpha'} | ${['zz', 'a']}
  `('value $value + press "$pressed" label emits $expected', async ({ value, pressed, expected }) => {
    // arrange
    const { props } = await renderWidget(CheckboxesWidget, {
      id: 'root_pick',
      value,
      options: { enumOptions: ENUM_OPTIONS },
    });

    // act
    await fireEvent.press(screen.getByText(pressed));

    // assert
    expect(props.onChange).toHaveBeenCalledWith(expected);
    expect(props.onBlur).toHaveBeenCalledWith('root_pick', expected);
  });

  it('toggles through the checkbox itself too', async () => {
    // arrange
    const { props } = await renderWidget(CheckboxesWidget, { value: [], options: { enumOptions: ENUM_OPTIONS } });

    // act
    await fireEvent.press(getCheckbox(2));

    // assert
    expect(props.onChange).toHaveBeenCalledWith(['c']);
  });

  it('ignores a check that would exceed schema.maxItems but still allows unchecking', async () => {
    // arrange
    const { props } = await renderWidget(CheckboxesWidget, {
      value: ['a'],
      schema: { type: 'array', maxItems: 1 },
      options: { enumOptions: ENUM_OPTIONS },
    });

    // act
    await fireEvent.press(screen.getByText('Beta'));

    // assert
    expect(props.onChange).not.toHaveBeenCalled();

    // act
    await fireEvent.press(screen.getByText('Alpha'));

    // assert
    expect(props.onChange).toHaveBeenCalledWith([]);
  });

  it('treats maxItems 0 as a limit', async () => {
    // arrange
    const { props } = await renderWidget(CheckboxesWidget, {
      value: [],
      schema: { type: 'array', maxItems: 0 },
      options: { enumOptions: ENUM_OPTIONS },
    });

    // act
    await fireEvent.press(screen.getByText('Alpha'));

    // assert
    expect(props.onChange).not.toHaveBeenCalled();
  });

  it.each`
    disabled | readonly
    ${true}  | ${false}
    ${false} | ${true}
  `(
    'ignores presses and disables checkboxes when disabled=$disabled readonly=$readonly',
    async ({ disabled, readonly }) => {
      // arrange
      const { props } = await renderWidget(CheckboxesWidget, {
        value: [],
        disabled,
        readonly,
        options: { enumOptions: ENUM_OPTIONS },
      });

      // act
      await fireEvent.press(screen.getByText('Alpha'));

      // assert
      expect(props.onChange).not.toHaveBeenCalled();
      expect(getCheckbox(0)).toBeDisabled();
    }
  );
});

describe('RadioWidget', () => {
  it('renders the title and every option', async () => {
    // act
    await renderWidget(RadioWidget, { label: 'Size', required: true, options: { enumOptions: ENUM_OPTIONS } });

    // assert
    expect(screen.getByText('Size *')).toBeOnTheScreen();
    expect(screen.getByRole('radio', { name: 'Alpha' })).toBeOnTheScreen();
    expect(screen.getByRole('radio', { name: 'Beta' })).toBeOnTheScreen();
    expect(screen.getByRole('radio', { name: 'Gamma' })).toBeOnTheScreen();
  });

  it.each`
    value        | checkedLabel
    ${'b'}       | ${'Beta'}
    ${undefined} | ${undefined}
    ${''}        | ${undefined}
    ${'zz'}      | ${undefined}
  `('checks option $checkedLabel for value $value', async ({ value, checkedLabel }) => {
    // act
    await renderWidget(RadioWidget, { value, options: { enumOptions: ENUM_OPTIONS } });

    // assert
    ENUM_OPTIONS.forEach(({ label }) => {
      const radio = screen.getByRole('radio', { name: label });
      if (label === checkedLabel) expect(radio).toBeChecked();
      else expect(radio).not.toBeChecked();
    });
  });

  it('matches a numeric value against its stringified option', async () => {
    // act
    await renderWidget(RadioWidget, { value: 1, options: { enumOptions: [{ value: 1, label: 'One' }] } });

    // assert
    expect(screen.getByRole('radio', { name: 'One' })).toBeChecked();
  });

  it('emits the stringified option value through onChange then onBlur', async () => {
    // arrange
    const { props } = await renderWidget(RadioWidget, {
      id: 'root_size',
      options: { enumOptions: [{ value: 1, label: 'One' }] },
    });

    // act
    await fireEvent.press(screen.getByText('One'));

    // assert
    expect(props.onChange).toHaveBeenCalledWith('1');
    expect(props.onBlur).toHaveBeenCalledWith('root_size', '1');
  });

  it.each`
    disabled | readonly
    ${true}  | ${false}
    ${false} | ${true}
  `('ignores presses when disabled=$disabled readonly=$readonly', async ({ disabled, readonly }) => {
    // arrange
    const { props } = await renderWidget(RadioWidget, { disabled, readonly, options: { enumOptions: ENUM_OPTIONS } });

    // act
    await fireEvent.press(screen.getByText('Beta'));

    // assert
    expect(props.onChange).not.toHaveBeenCalled();
  });
});

describe('RadioYesNoWidget', () => {
  const YES_NO = [
    { value: '', label: 'N/A' },
    { value: 'no', label: 'Non' },
    { value: 'yes', label: 'Oui' },
  ];

  it('renders the yes option before the no option regardless of enum order', async () => {
    // act
    await renderWidget(RadioYesNoWidget, { label: 'Ok?', options: { enumOptions: YES_NO } });

    // assert
    const texts = screen.getAllByText(/Oui|Non|N\/A/).map((node) => node.props.children);
    expect(texts).toEqual(['Oui', 'Non']);
    expect(screen.getByText('Ok?')).toBeOnTheScreen();
  });

  it('falls back to the first two enum options when no yes/no values exist', async () => {
    // act
    await renderWidget(RadioYesNoWidget, {
      options: {
        enumOptions: [
          { value: 'true', label: 'Vrai' },
          { value: 'false', label: 'Faux' },
          { value: 'x', label: 'Autre' },
        ],
      },
    });

    // assert
    expect(screen.getByText('Vrai')).toBeOnTheScreen();
    expect(screen.getByText('Faux')).toBeOnTheScreen();
    expect(screen.queryByText('Autre')).not.toBeOnTheScreen();
  });

  it('renders a single option when only one enum exists', async () => {
    // act
    await renderWidget(RadioYesNoWidget, { options: { enumOptions: [{ value: 'yes', label: 'Oui' }] } });

    // assert
    expect(screen.getByText('Oui')).toBeOnTheScreen();
    expect(screen.getAllByRole('radio')).toHaveLength(1);
  });

  it('renders the "yes" option for both slots when it is the only option found first', async () => {
    // act
    await renderWidget(RadioYesNoWidget, {
      options: {
        enumOptions: [
          { value: 'yes', label: 'Oui' },
          { value: 'maybe', label: 'Peut-être' },
        ],
      },
    });

    // assert
    expect(screen.getByText('Oui')).toBeOnTheScreen();
    expect(screen.getByText('Peut-être')).toBeOnTheScreen();
  });

  it('renders nothing selectable without enum options', async () => {
    // act
    await renderWidget(RadioYesNoWidget, { label: 'Ok?', options: {} });

    // assert
    expect(screen.getByText('Ok?')).toBeOnTheScreen();
    expect(screen.queryAllByRole('radio')).toHaveLength(0);
  });

  it.each`
    value        | yesChecked | noChecked
    ${'yes'}     | ${true}    | ${false}
    ${'no'}      | ${false}   | ${true}
    ${''}        | ${false}   | ${false}
    ${undefined} | ${false}   | ${false}
    ${true}      | ${false}   | ${false}
  `('value $value -> yes=$yesChecked no=$noChecked', async ({ value, yesChecked, noChecked }) => {
    // act
    await renderWidget(RadioYesNoWidget, { value, options: { enumOptions: YES_NO } });

    // assert
    const [yesRadio, noRadio] = screen.getAllByRole('radio');
    expect(yesRadio.props.accessibilityState?.checked).toBe(yesChecked);
    expect(noRadio.props.accessibilityState?.checked).toBe(noChecked);
  });

  it.each`
    pressed  | expected
    ${'Oui'} | ${'yes'}
    ${'Non'} | ${'no'}
  `('pressing "$pressed" emits $expected through onChange then onBlur', async ({ pressed, expected }) => {
    // arrange
    const { props } = await renderWidget(RadioYesNoWidget, { id: 'root_ok', options: { enumOptions: YES_NO } });

    // act
    await fireEvent.press(screen.getByText(pressed));

    // assert
    expect(props.onChange).toHaveBeenCalledWith(expected);
    expect(props.onBlur).toHaveBeenCalledWith('root_ok', expected);
  });

  it('pressing the radio itself emits the value', async () => {
    // arrange
    const { props } = await renderWidget(RadioYesNoWidget, { options: { enumOptions: YES_NO } });

    // act
    await fireEvent.press(screen.getAllByRole('radio')[1]);

    // assert
    expect(props.onChange).toHaveBeenCalledWith('no');
  });

  it('re-emits the already selected value', async () => {
    // arrange
    const { props } = await renderWidget(RadioYesNoWidget, { value: 'yes', options: { enumOptions: YES_NO } });

    // act
    await fireEvent.press(screen.getByText('Oui'));

    // assert
    expect(props.onChange).toHaveBeenCalledWith('yes');
  });

  it.each`
    disabled | readonly
    ${true}  | ${false}
    ${false} | ${true}
  `('ignores presses when disabled=$disabled readonly=$readonly', async ({ disabled, readonly }) => {
    // arrange
    const { props } = await renderWidget(RadioYesNoWidget, { disabled, readonly, options: { enumOptions: YES_NO } });

    // act
    await fireEvent.press(screen.getByText('Oui'));
    await fireEvent.press(screen.getAllByRole('radio')[1]);

    // assert
    expect(props.onChange).not.toHaveBeenCalled();
  });

  it('colors the option labels with yesColor / noColor', async () => {
    // act
    await renderWidget(RadioYesNoWidget, {
      options: { enumOptions: YES_NO, yesColor: 'green', noColor: 'red' },
    });

    // assert
    expect(screen.getByText('Oui')).toHaveStyle({ color: 'green' });
    expect(screen.getByText('Non')).toHaveStyle({ color: 'red' });
  });
});
