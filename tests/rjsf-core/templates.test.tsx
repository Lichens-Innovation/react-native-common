import { PAPER_TEMPLATES } from '@lib/rjsf';
import type { RJSFSchema } from '@rjsf/utils';
import { fireEvent, screen } from '@testing-library/react-native';
import { Text } from 'react-native';
import { renderForm, renderWithProviders } from './render-with-providers';

const keepWhitespace = { normalizer: (text: string) => text };

describe('PAPER_TEMPLATES', () => {
  it('overrides the RN-incompatible rjsf templates and button templates', () => {
    // assert
    expect(PAPER_TEMPLATES).toEqual(
      expect.objectContaining({
        ObjectFieldTemplate: expect.any(Function),
        FieldTemplate: expect.any(Function),
        FieldErrorTemplate: expect.any(Function),
        FieldHelpTemplate: expect.any(Function),
        ArrayFieldTemplate: expect.any(Function),
        ArrayFieldItemTemplate: expect.any(Function),
        ErrorListTemplate: expect.any(Function),
        GridTemplate: expect.any(Function),
      })
    );
    expect(Object.keys(PAPER_TEMPLATES.ButtonTemplates)).toEqual(
      expect.arrayContaining([
        'AddButton',
        'ClearButton',
        'CopyButton',
        'MoveDownButton',
        'MoveUpButton',
        'RemoveButton',
        'SubmitButton',
      ])
    );
  });

  it('ErrorListTemplate renders nothing', async () => {
    // arrange
    const ErrorList = PAPER_TEMPLATES.ErrorListTemplate as unknown as () => null;

    // act
    const result = ErrorList();

    // assert
    expect(result).toBeNull();
  });

  it.each`
    column   | flexDirection
    ${true}  | ${'column'}
    ${false} | ${'row'}
  `('GridTemplate lays children out as $flexDirection when column=$column', async ({ column, flexDirection }) => {
    // arrange
    const Grid = PAPER_TEMPLATES.GridTemplate as unknown as React.ComponentType<Record<string, unknown>>;

    // act
    await renderWithProviders(
      <Grid column={column} accessibilityLabel="grid" style={{ padding: 3 }}>
        <Text>cell</Text>
      </Grid>
    );

    // assert
    expect(screen.getByText('cell')).toBeOnTheScreen();
    expect(screen.getByLabelText('grid')).toHaveStyle({ flexDirection, padding: 3 });
  });
});

describe('ObjectFieldTemplate (through RjsfPaperRenderer)', () => {
  it('renders title and string description', async () => {
    // act
    await renderForm({
      schema: { type: 'object', title: 'Root title', description: 'Root description', properties: {} },
    });

    // assert
    expect(screen.getByText('Root title')).toBeOnTheScreen();
    expect(screen.getByText('Root description')).toBeOnTheScreen();
  });

  it('renders no title text when title is absent', async () => {
    // act
    await renderForm({ schema: { type: 'object', properties: { a: { type: 'boolean', title: 'Flag' } } } });

    // assert
    expect(screen.queryByText('Root title')).toBeNull();
    expect(screen.getByText('Flag')).toBeOnTheScreen();
  });

  it('renders a whitespace-only title (old truthy check)', async () => {
    // act
    await renderForm({ schema: { type: 'object', title: '   ', properties: {} } });

    // assert
    expect(screen.getByText('   ', keepWhitespace)).toBeOnTheScreen();
  });

  it('applies a valid hex ui:options.labelColor to the title', async () => {
    // act
    await renderForm({
      schema: { type: 'object', title: 'Colored', properties: {} },
      uiSchema: { 'ui:options': { labelColor: '#ff0000' } },
    });

    // assert
    expect(screen.getByText('Colored')).toHaveStyle({ color: '#ff0000' });
  });

  it('renders nested object titles and hides ui:widget hidden properties', async () => {
    // act
    await renderForm({
      schema: {
        type: 'object',
        properties: {
          nested: { type: 'object', title: 'Nested section', properties: { b: { type: 'boolean', title: 'B' } } },
          secret: { type: 'string', title: 'Secret' },
        },
      },
      uiSchema: { secret: { 'ui:widget': 'hidden' } },
    });

    // assert
    expect(screen.getByText('Nested section')).toBeOnTheScreen();
    expect(screen.getByText('B')).toBeOnTheScreen();
    expect(screen.queryByText('Secret')).toBeNull();
  });
});

describe('FieldTemplate / FieldErrorTemplate / FieldHelpTemplate (through RjsfPaperRenderer)', () => {
  const schema: RJSFSchema = {
    type: 'object',
    required: ['name'],
    properties: { name: { type: 'string', title: 'Name', description: 'Field description' } },
  };

  it('does not render ui:help nor the field-level description', async () => {
    // act
    await renderForm({ schema, uiSchema: { name: { 'ui:help': 'Help text' } } });

    // assert
    expect(screen.queryByText('Help text')).toBeNull();
    expect(screen.queryByText('Field description')).toBeNull();
  });

  it('shows the validation error under the field once (top error list suppressed) and calls onError', async () => {
    // arrange
    const onSubmit = jest.fn();
    const onError = jest.fn();
    await renderForm({ schema, onSubmit, onError });

    // act
    await fireEvent.press(screen.getByText('Submit'));

    // assert
    expect(screen.getAllByText("must have required property 'Name'")).toHaveLength(1);
    expect(onSubmit).not.toHaveBeenCalled();
    expect(onError).toHaveBeenCalledWith([expect.objectContaining({ name: 'required', property: 'name' })]);
  });

  it('renders every error message, including duplicates', async () => {
    // arrange
    await renderForm({
      schema: { type: 'object', properties: { name: { type: 'string', title: 'Name' } } },
      onError: jest.fn(),
      customValidate: (_formData, errors) => {
        errors.name?.addError('Duplicate');
        errors.name?.addError('Duplicate');
        errors.name?.addError('Other');
        return errors;
      },
    });

    // act
    await fireEvent.press(screen.getByText('Submit'));

    // assert
    expect(screen.getAllByText('Duplicate')).toHaveLength(2);
    expect(screen.getByText('Other')).toBeOnTheScreen();
  });

  it('renders no error text before submit', async () => {
    // act
    await renderForm({ schema });

    // assert
    expect(screen.queryByText("must have required property 'Name'")).toBeNull();
  });
});

describe('ArrayFieldTemplate / ArrayFieldItemTemplate (through RjsfPaperRenderer)', () => {
  const schema: RJSFSchema = {
    type: 'object',
    properties: { tags: { type: 'array', title: 'Tags', items: { type: 'string' } } },
  };

  const lastFormData = (onChange: jest.Mock) => onChange.mock.calls.at(-1)?.[0].formData;

  it('renders the title, one row per item with move/remove toolbar, and an add button', async () => {
    // act
    await renderForm({ schema, formData: { tags: ['a', 'b'] } });

    // assert
    expect(screen.getByText('Tags')).toBeOnTheScreen();
    expect(screen.getByDisplayValue('a')).toBeOnTheScreen();
    expect(screen.getByDisplayValue('b')).toBeOnTheScreen();
    expect(screen.getAllByLabelText('remove')).toHaveLength(2);
    expect(screen.getAllByLabelText('moveUp')).toHaveLength(2);
    expect(screen.getAllByLabelText('moveDown')).toHaveLength(2);
    expect(screen.getAllByLabelText('addItem')).toHaveLength(1);
    expect(screen.queryByLabelText('copy')).toBeNull();
  });

  it('applies a valid hex labelColor to the array title', async () => {
    // act
    await renderForm({ schema, uiSchema: { tags: { 'ui:options': { labelColor: '#00ff00' } } } });

    // assert
    expect(screen.getByText('Tags')).toHaveStyle({ color: '#00ff00' });
  });

  it('adds an item on add press', async () => {
    // arrange
    const onChange = jest.fn();
    await renderForm({ schema, formData: { tags: ['a'] }, onChange });

    // act
    await fireEvent.press(screen.getByLabelText('addItem'));

    // assert
    expect(lastFormData(onChange)).toEqual({ tags: ['a', undefined] });
    expect(screen.getAllByLabelText('remove')).toHaveLength(2);
  });

  it('removes the pressed item', async () => {
    // arrange
    const onChange = jest.fn();
    await renderForm({ schema, formData: { tags: ['a', 'b'] }, onChange });

    // act
    await fireEvent.press(screen.getAllByLabelText('remove')[0]);

    // assert
    expect(lastFormData(onChange)).toEqual({ tags: ['b'] });
  });

  it('moves an item down', async () => {
    // arrange
    const onChange = jest.fn();
    await renderForm({ schema, formData: { tags: ['a', 'b'] }, onChange });

    // act
    // rjsf's reorder handler blurs event.currentTarget (web API), so hand it a minimal event habit-hooks-disable non-essential-comment
    await fireEvent.press(screen.getAllByLabelText('moveDown')[0], {
      currentTarget: { blur: jest.fn() },
      preventDefault: jest.fn(),
    });

    // assert
    expect(lastFormData(onChange)).toEqual({ tags: ['b', 'a'] });
  });

  it('copies an item when ui:options.copyable is set', async () => {
    // arrange
    const onChange = jest.fn();
    await renderForm({
      schema,
      uiSchema: { tags: { 'ui:options': { copyable: true } } },
      formData: { tags: ['a'] },
      onChange,
    });

    // act
    await fireEvent.press(screen.getByLabelText('copy'));

    // assert
    expect(lastFormData(onChange)).toEqual({ tags: ['a', 'a'] });
  });

  it('hides the add button and the item toolbar when addable/orderable/removable are false', async () => {
    // act
    await renderForm({
      schema,
      uiSchema: { tags: { 'ui:options': { addable: false, orderable: false, removable: false } } },
      formData: { tags: ['a'] },
    });

    // assert
    expect(screen.getByDisplayValue('a')).toBeOnTheScreen();
    expect(screen.queryByLabelText('addItem')).toBeNull();
    expect(screen.queryByLabelText('remove')).toBeNull();
    expect(screen.queryByLabelText('moveUp')).toBeNull();
  });

  it('hides the add button when maxItems is reached', async () => {
    // act
    await renderForm({
      schema: { type: 'object', properties: { tags: { type: 'array', maxItems: 1, items: { type: 'string' } } } },
      formData: { tags: ['a'] },
    });

    // assert
    expect(screen.queryByLabelText('addItem')).toBeNull();
  });

  it('disables the toolbar buttons on a disabled form', async () => {
    // act
    await renderForm({ schema, formData: { tags: ['a'] }, disabled: true });

    // assert
    expect(screen.getByLabelText('remove')).toBeDisabled();
  });
});
