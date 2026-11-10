import type { RJSFSchema, UiSchema } from '@rjsf/utils';
import { fireEvent, screen } from '@testing-library/react-native';
import { renderForm, renderWithProviders, testI18n } from './render-with-providers';
import { RjsfPaperRenderer } from '@lib/rjsf';

const numberProps = {
  a: { type: 'number', title: 'A' },
  b: { type: 'number', title: 'B' },
} as const;

const buildSchema = (extra: RJSFSchema['properties'] = {}, computed: RJSFSchema = { type: 'number', title: 'Total' }) =>
  ({ type: 'object', properties: { ...numberProps, ...extra, total: computed } }) as RJSFSchema;

const computedUi = (options: Record<string, unknown>, extra: UiSchema = {}): UiSchema => ({
  ...extra,
  total: { 'ui:field': 'ComputedField', 'ui:options': options },
});

const anyDisplayValue = /.*/;
const allInputs = () => screen.getAllByDisplayValue(anyDisplayValue);
const computedInput = () => allInputs()[allInputs().length - 1];
const inputAt = (index: number) => allInputs()[index];
const lastFormData = (onChange: jest.Mock) => onChange.mock.calls.at(-1)?.[0].formData;

describe('ComputedField', () => {
  describe('formula evaluation', () => {
    it.each`
      formula          | a     | b    | precision    | expected
      ${'{a}+{b}'}     | ${1}  | ${2} | ${undefined} | ${'3'}
      ${'{a}/{b}'}     | ${1}  | ${3} | ${undefined} | ${'0.33'}
      ${'{a}/{b}'}     | ${1}  | ${3} | ${0}         | ${'0'}
      ${'{a}/{b}'}     | ${1}  | ${3} | ${4}         | ${'0.3333'}
      ${'{a}/{b}'}     | ${2}  | ${4} | ${4}         | ${'0.5'}
      ${'{a}*{a}+{b}'} | ${3}  | ${1} | ${undefined} | ${'10'}
      ${'{a}-{b}'}     | ${-2} | ${3} | ${undefined} | ${'-5'}
      ${'2*3'}         | ${1}  | ${1} | ${undefined} | ${'6'}
      ${'{a}/{b}'}     | ${1}  | ${0} | ${undefined} | ${'—'}
      ${'{a} +* )'}    | ${1}  | ${2} | ${undefined} | ${'—'}
      ${''}            | ${1}  | ${2} | ${undefined} | ${'—'}
      ${'   '}         | ${1}  | ${2} | ${undefined} | ${'—'}
    `(
      'formula "$formula" with a=$a b=$b precision=$precision → $expected',
      async ({ formula, a, b, precision, expected }) => {
        // act
        await renderForm({ schema: buildSchema(), uiSchema: computedUi({ formula, precision }), formData: { a, b } });

        // assert
        expect(computedInput()).toHaveDisplayValue(expected);
      }
    );

    it('ignores a non-string formula and a non-number precision', async () => {
      // act
      await renderForm({
        schema: buildSchema(),
        uiSchema: computedUi({ formula: 42, precision: '4' }),
        formData: { a: 1, b: 3 },
      });

      // assert
      expect(computedInput()).toHaveDisplayValue('—');
    });

    it('treats a missing variable as unresolved', async () => {
      // act
      await renderForm({ schema: buildSchema(), uiSchema: computedUi({ formula: '{a}+{b}' }), formData: { a: 1 } });

      // assert
      expect(computedInput()).toHaveDisplayValue('—');
    });

    it('accepts integer-typed sources', async () => {
      // act
      await renderForm({
        schema: buildSchema({ n: { type: 'integer', title: 'N' } }),
        uiSchema: computedUi({ formula: '{n}*2' }),
        formData: { n: 4 },
      });

      // assert
      expect(computedInput()).toHaveDisplayValue('8');
    });

    it.each`
      case                                | n                               | expected
      ${'fetched wrapper with data'}      | ${{ data: 4, fetched_at: 'x' }} | ${'8'}
      ${'wrapper with only feature_uuid'} | ${{ feature_uuid: 'u' }}        | ${'—'}
      ${'wrapper with non-numeric data'}  | ${{ data: '4' }}                | ${'—'}
      ${'plain object (not a wrapper)'}   | ${{ foo: 1 }}                   | ${'—'}
      ${'unanswered object'}              | ${undefined}                    | ${'—'}
    `('object-typed source: $case → $expected', async ({ n, expected }) => {
      // act
      await renderForm({
        schema: buildSchema({ n: { type: 'object', title: 'Fetched', properties: {} } }),
        uiSchema: computedUi({ formula: '{n}*2' }, { n: { 'ui:widget': 'hidden' } }),
        formData: { n },
      });

      // assert
      expect(computedInput()).toHaveDisplayValue(expected);
    });

    it('rejects string-typed sources and unknown slugs', async () => {
      // act
      await renderForm({
        schema: buildSchema({ s: { type: 'string', title: 'S' } }),
        uiSchema: computedUi({ formula: '{s}+{unknown}' }),
        formData: { s: '3' },
      });

      // assert
      expect(computedInput()).toHaveDisplayValue('—');
    });
  });

  describe('rendering', () => {
    it('shows the label with required marker', async () => {
      // act
      await renderForm({
        schema: { ...buildSchema(), required: ['total'] },
        uiSchema: computedUi({ formula: '{a}' }),
        formData: { a: 1 },
      });

      // assert
      expect(screen.getAllByText('Total *').length).toBeGreaterThan(0);
    });

    it('hides the label when ui:options.label is false', async () => {
      // act
      await renderForm({
        schema: buildSchema(),
        uiSchema: computedUi({ formula: '{a}', label: false }),
        formData: { a: 1 },
      });

      // assert
      expect(screen.queryByText('Total')).toBeNull();
    });

    it.each`
      unit         | shown
      ${'kg'}      | ${true}
      ${undefined} | ${false}
      ${''}        | ${false}
      ${'  '}      | ${false}
      ${42}        | ${false}
    `('unit="$unit" renders affix: $shown', async ({ unit, shown }) => {
      // act
      await renderForm({ schema: buildSchema(), uiSchema: computedUi({ formula: '{a}', unit }), formData: { a: 1 } });

      // assert
      // eslint-disable-next-line coding-guide/prefer-role-query-over-testid -- an absent affix (empty/non-string unit) has no text to query; Paper's affix node is only reachable by testID
      expect(screen.queryByTestId('right-affix-adornment-text') !== null).toBe(shown);
      if (shown) expect(screen.getByText(unit)).toBeOnTheScreen();
    });

    it('is not editable', async () => {
      // act
      await renderForm({ schema: buildSchema(), uiSchema: computedUi({ formula: '{a}' }), formData: { a: 1 } });

      // assert
      expect(computedInput()).toHaveProp('editable', false);
    });

    it.each`
      formula      | showInfoButton | shown
      ${'{a}'}     | ${undefined}   | ${true}
      ${'{a}'}     | ${true}        | ${true}
      ${'{a}'}     | ${false}       | ${false}
      ${''}        | ${undefined}   | ${false}
      ${undefined} | ${undefined}   | ${false}
      ${'   '}     | ${undefined}   | ${false}
    `(
      'info button shown=$shown for formula="$formula" showInfoButton=$showInfoButton',
      async ({ formula, showInfoButton, shown }) => {
        // act
        await renderForm({
          schema: buildSchema(),
          uiSchema: computedUi({ formula, showInfoButton }),
          formData: { a: 1 },
        });

        // assert
        expect(screen.queryByLabelText('Show formula') !== null).toBe(shown);
      }
    );
  });

  describe('info dialog', () => {
    it('lists formula and variables with status, then closes', async () => {
      // arrange
      await renderForm({
        schema: buildSchema({ s: { type: 'string', title: 'S' } }),
        uiSchema: computedUi({ formula: '{a}+{b}+{s}+{a}' }),
        formData: { a: 1, s: 'x' },
      });

      // act
      await fireEvent.press(screen.getByLabelText('Show formula'));

      // assert
      expect(screen.getAllByText('Total').length).toBeGreaterThan(0);
      expect(screen.getByText('Formula')).toBeOnTheScreen();
      expect(screen.getByText('{a}+{b}+{s}+{a}')).toBeOnTheScreen();
      expect(screen.getByText('Variables')).toBeOnTheScreen();
      expect(screen.getByText('a: A = 1')).toBeOnTheScreen();
      expect(screen.getByText('b: B = null')).toBeOnTheScreen();
      expect(screen.getByText('s: S = not a number field')).toBeOnTheScreen();
      expect(screen.getAllByText(/^a: A/)).toHaveLength(1);

      // act
      await fireEvent.press(screen.getByText('close'));

      // assert
      expect(screen.queryByText('Variables')).toBeNull();
    });

    it('uses "Formula" as dialog title when the label is hidden, and omits Variables for constant formulas', async () => {
      // arrange
      await renderForm({ schema: buildSchema(), uiSchema: computedUi({ formula: '1+1', label: false }) });

      // act
      await fireEvent.press(screen.getByLabelText('Show formula'));

      // assert
      expect(screen.getAllByText('Formula')).toHaveLength(2);
      expect(screen.getByText('1+1')).toBeOnTheScreen();
      expect(screen.queryByText('Variables')).toBeNull();
    });

    it('shows the bare slug for a variable without schema title or with a whitespace-only title', async () => {
      // arrange
      await renderForm({
        schema: buildSchema({ x: { type: 'number' }, w: { type: 'number', title: '   ' } }),
        uiSchema: computedUi({ formula: '{x}+{w}' }),
        formData: { x: 2, w: 3 },
      });

      // act
      await fireEvent.press(screen.getByLabelText('Show formula'));

      // assert
      expect(screen.getByText('x = 2')).toBeOnTheScreen();
      expect(screen.getByText('w = 3')).toBeOnTheScreen();
    });

    it('offers no way to open the dialog for a whitespace-only formula', async () => {
      // act
      await renderForm({ schema: buildSchema(), uiSchema: computedUi({ formula: '   ' }) });

      // assert
      expect(screen.queryByLabelText('Show formula')).toBeNull();
      expect(screen.queryByText('Formula')).toBeNull();
      expect(screen.queryByText('(none)')).toBeNull();
    });
  });

  describe('write-back to form data', () => {
    it('seeds an absent stored value on mount', async () => {
      // arrange
      const onChange = jest.fn();

      // act
      await renderForm({
        schema: buildSchema(),
        uiSchema: computedUi({ formula: '{a}+{b}' }),
        formData: { a: 1, b: 2 },
        onChange,
      });

      // assert
      expect(lastFormData(onChange)).toEqual({ a: 1, b: 2, total: 3 });
    });

    it('keeps a stale but finite stored value on mount (no dirtying)', async () => {
      // arrange
      const onChange = jest.fn();

      // act
      await renderForm({
        schema: buildSchema(),
        uiSchema: computedUi({ formula: '{a}+{b}' }),
        formData: { a: 1, b: 2, total: 99 },
        onChange,
      });

      // assert
      expect(onChange).not.toHaveBeenCalled();
      expect(computedInput()).toHaveDisplayValue('3');
    });

    it('keeps a stale but finite stored value when an unrelated field is edited', async () => {
      // arrange
      const onChange = jest.fn();
      await renderForm({
        schema: buildSchema({ note: { type: 'string', title: 'Note' } }),
        uiSchema: computedUi({ formula: '{a}+{b}' }),
        formData: { a: 1, b: 2, note: '', total: 99 },
        onChange,
      });

      // act
      await fireEvent.changeText(inputAt(2), 'hello');

      // assert
      expect(lastFormData(onChange)).toEqual({ a: 1, b: 2, note: 'hello', total: 99 });
    });

    it('overwrites a non-finite stored value on mount', async () => {
      // arrange
      const onChange = jest.fn();

      // act
      await renderForm({
        schema: buildSchema(),
        uiSchema: computedUi({ formula: '{a}+{b}' }),
        formData: { a: 1, b: 2, total: 'stale' },
        onChange,
      });

      // assert
      expect(lastFormData(onChange)).toEqual({ a: 1, b: 2, total: 3 });
    });

    it('does not clear a stored value on mount when the formula is unresolved', async () => {
      // arrange
      const onChange = jest.fn();

      // act
      await renderForm({
        schema: buildSchema(),
        uiSchema: computedUi({ formula: '{a}+{b}' }),
        formData: { a: 1, total: 5 },
        onChange,
      });

      // assert
      expect(onChange).not.toHaveBeenCalled();
      expect(computedInput()).toHaveDisplayValue('—');
    });

    it('writes the new value when a dependency is typed (live value, same keystroke)', async () => {
      // arrange
      const onChange = jest.fn();
      await renderForm({
        schema: buildSchema(),
        uiSchema: computedUi({ formula: '{a}+{b}' }),
        formData: { a: 1, b: 2, total: 3 },
        onChange,
      });

      // act
      await fireEvent.changeText(inputAt(0), '10');

      // assert
      expect(computedInput()).toHaveDisplayValue('12');
      expect(lastFormData(onChange)).toEqual({ a: 10, b: 2, total: 12 });
    });

    it('clears the computed value when a dependency is emptied (SPOTD-621)', async () => {
      // arrange
      const onChange = jest.fn();
      await renderForm({
        schema: buildSchema(),
        uiSchema: computedUi({ formula: '{a}+{b}' }),
        formData: { a: 1, b: 2, total: 3 },
        onChange,
      });
      await fireEvent(inputAt(0), 'focus');

      // act
      await fireEvent.changeText(inputAt(0), '');

      // assert
      expect(computedInput()).toHaveDisplayValue('—');
      expect(lastFormData(onChange)).toEqual({ a: undefined, b: 2, total: undefined });
    });

    it('stays cleared after the emptied field is blurred', async () => {
      // arrange
      await renderForm({
        schema: buildSchema(),
        uiSchema: computedUi({ formula: '{a}+{b}' }),
        formData: { a: 1, b: 2, total: 3 },
      });
      await fireEvent(inputAt(0), 'focus');
      await fireEvent.changeText(inputAt(0), '');

      // act
      await fireEvent(inputAt(0), 'blur');

      // assert
      expect(computedInput()).toHaveDisplayValue('—');
    });

    it('recomputes after a digitless intermediate ("-") then a number', async () => {
      // arrange
      await renderForm({
        schema: buildSchema(),
        uiSchema: computedUi({ formula: '{a}+{b}' }),
        formData: { a: 1, b: 2 },
      });
      await fireEvent(inputAt(0), 'focus');

      // act
      await fireEvent.changeText(inputAt(0), '-');

      // assert
      expect(computedInput()).toHaveDisplayValue('—');

      // act
      await fireEvent.changeText(inputAt(0), '-4');

      // assert
      expect(computedInput()).toHaveDisplayValue('-2');
    });

    it('a nested property with the same name does not feed a top-level formula', async () => {
      // arrange
      await renderForm({
        schema: {
          type: 'object',
          properties: {
            a: { type: 'number', title: 'A' },
            nested: { type: 'object', properties: { a: { type: 'number', title: 'Nested A' } } },
            total: { type: 'number', title: 'Total' },
          },
        },
        uiSchema: computedUi({ formula: '{a}*10' }),
        formData: { a: 1, nested: {} },
      });

      // act
      await fireEvent.changeText(inputAt(1), '7');

      // assert
      expect(computedInput()).toHaveDisplayValue('10');
    });

    it('recomputes when the caller passes a new formData object (re-seed)', async () => {
      // arrange
      const schema = buildSchema();
      const uiSchema = computedUi({ formula: '{a}+{b}' });
      const { rerender } = await renderWithProviders(
        <RjsfPaperRenderer i18n={testI18n} schema={schema} uiSchema={uiSchema} formData={{ a: 1, b: 2 }} />
      );

      // act
      await rerender(
        <RjsfPaperRenderer i18n={testI18n} schema={schema} uiSchema={uiSchema} formData={{ a: 5, b: 5 }} />
      );

      // assert
      expect(computedInput()).toHaveDisplayValue('10');
    });
  });

  it('applies a valid hex labelColor through the input theme', async () => {
    // act
    await renderForm({
      schema: buildSchema(),
      uiSchema: computedUi({ formula: '{a}', labelColor: '#123456' }),
      formData: { a: 1 },
    });

    // assert
    expect(screen.getAllByText('Total').some((node) => JSON.stringify(node.props.style).includes('#123456'))).toBe(
      true
    );
  });
});
