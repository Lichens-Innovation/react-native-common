import { RjsfPaperRenderer, RjsfPaperRendererDebug } from '@lib/rjsf';
import type { FieldProps, ObjectFieldTemplateProps, RJSFSchema, WidgetProps } from '@rjsf/utils';
import { fireEvent, screen } from '@testing-library/react-native';
import i18next from 'i18next';
import { Text } from 'react-native';
import { renderForm, renderWithProviders, testI18n } from './render-with-providers';

const schema: RJSFSchema = {
  type: 'object',
  properties: { name: { type: 'string', title: 'Name' }, age: { type: 'number', title: 'Age' } },
};

const allText = () => {
  const parts: string[] = [];
  const walk = (node: unknown) => {
    if (typeof node === 'string') parts.push(node);
    else if (node && typeof node === 'object') (node as { children?: unknown[] }).children?.forEach(walk);
  };
  walk(screen.container);
  return parts.join('').replace(/\s+/g, '');
};

describe('RjsfPaperRenderer', () => {
  it('forwards onChange with (event, fieldId)', async () => {
    // arrange
    const onChange = jest.fn();
    await renderForm({ schema, formData: { name: 'Ann' }, onChange });
    onChange.mockClear();

    // act
    await fireEvent.changeText(screen.getByDisplayValue('Ann'), 'Bob');

    // assert
    expect(onChange).toHaveBeenLastCalledWith(expect.objectContaining({ formData: { name: 'Bob' } }), 'root_name');
  });

  it('submits current form data via the Paper submit button', async () => {
    // arrange
    const onSubmit = jest.fn();
    await renderForm({ schema, formData: { name: 'Ann', age: 3 }, onSubmit });

    // act
    await fireEvent.press(screen.getByText('Submit'));

    // assert
    expect(onSubmit).toHaveBeenCalledTimes(1);
    expect(onSubmit.mock.calls[0][0].formData).toEqual({ name: 'Ann', age: 3 });
  });

  it('does not throw without onChange/onSubmit', async () => {
    // arrange
    await renderForm({ schema, formData: { name: 'Ann' } });

    // act
    await fireEvent.changeText(screen.getByDisplayValue('Ann'), 'X');
    await fireEvent.press(screen.getByText('Submit'));

    // assert
    expect(screen.getByDisplayValue('X')).toBeOnTheScreen();
  });

  it('uses submitButtonOverrideLabel', async () => {
    // act
    await renderForm({ schema, submitButtonOverrideLabel: 'Save' });

    // assert
    expect(screen.getByText('Save')).toBeOnTheScreen();
    expect(screen.queryByText('Submit')).toBeNull();
  });

  it.each`
    absolute | spacers
    ${true}  | ${1}
    ${false} | ${0}
  `(
    'submitButtonAbsolutePosition=$absolute renders $spacers footer spacer(s) of insets.bottom + 96',
    async ({ absolute, spacers }) => {
      // arrange
      const onSubmit = jest.fn();
      await renderForm({ schema, submitButtonAbsolutePosition: absolute, onSubmit });

      // act
      await fireEvent.press(screen.getByText('Submit'));

      // assert
      expect(onSubmit).toHaveBeenCalledTimes(1);
      expect(countHeight96()).toBe(spacers);
    }
  );

  it('lets custom widgets override the theme widgets', async () => {
    // arrange
    const CustomText = ({ label }: WidgetProps) => <Text>custom:{label}</Text>;

    // act
    await renderForm({ schema, widgets: { TextWidget: CustomText } });

    // assert
    expect(screen.getByText('custom:Name')).toBeOnTheScreen();
  });

  it('lets custom templates override the Paper templates', async () => {
    // arrange
    const CustomObject = ({ title }: ObjectFieldTemplateProps) => <Text>object:{title ?? 'none'}</Text>;

    // act
    await renderForm({ schema: { ...schema, title: 'Root' }, templates: { ObjectFieldTemplate: CustomObject } });

    // assert
    expect(screen.getByText('object:Root')).toBeOnTheScreen();
    expect(screen.queryByText('Name')).toBeNull();
  });

  it('lets custom fields be used alongside the theme fields, and passes formContext through', async () => {
    // arrange
    const MyField = ({ registry }: FieldProps) => <Text>ctx:{String(registry.formContext?.flag)}</Text>;

    // act
    await renderForm({
      schema,
      uiSchema: {
        name: { 'ui:field': 'MyField' },
        age: { 'ui:field': 'ComputedField', 'ui:options': { formula: '1+1' } },
      },
      fields: { MyField },
      formContext: { flag: 'yes' },
    });

    // assert
    expect(screen.getByText('ctx:yes')).toBeOnTheScreen();
    expect(screen.getByDisplayValue('2')).toBeOnTheScreen();
  });

  it('translates rjsf strings through the given i18n instance', async () => {
    // arrange
    const i18n = i18next.createInstance();
    await i18n.init({ lng: 'en', resources: { en: { rjsf: { addItem: 'Add a row' } } } });

    // act
    await renderForm({
      schema: { type: 'object', properties: { list: { type: 'array', items: { type: 'string' } } } },
      i18n,
    });

    // assert
    expect(screen.getByLabelText('Add a row')).toBeOnTheScreen();
  });

  it('remounts the form (dropping uncontrolled edits) when i18n.language changes', async () => {
    // arrange
    const i18n = i18next.createInstance();
    await i18n.init({ lng: 'en', resources: {} });
    const ui = () => <RjsfPaperRenderer i18n={i18n} schema={schema} formData={{ name: 'Ann' }} />;
    const { rerender } = await renderWithProviders(ui());
    await fireEvent.changeText(screen.getByDisplayValue('Ann'), 'Edited');

    // act
    await i18n.changeLanguage('fr');
    await rerender(ui());

    // assert
    expect(screen.getByDisplayValue('Ann')).toBeOnTheScreen();
    expect(screen.queryByDisplayValue('Edited')).toBeNull();
  });

  it('keeps uncontrolled edits on re-render with the same formData object', async () => {
    // arrange
    const formData = { name: 'Ann' };
    const ui = () => <RjsfPaperRenderer i18n={testI18n} schema={schema} formData={formData} />;
    const { rerender } = await renderWithProviders(ui());
    await fireEvent.changeText(screen.getByDisplayValue('Ann'), 'Edited');

    // act
    await rerender(ui());

    // assert
    expect(screen.getByDisplayValue('Edited')).toBeOnTheScreen();
  });
});

const countHeight96 = () => {
  let count = 0;
  const walk = (node: unknown) => {
    if (!node || typeof node !== 'object') return;
    const { props, children } = node as { props?: { style?: unknown }; children?: unknown[] };
    const style = props?.style as { height?: number } | undefined;
    if (style && !Array.isArray(style) && style.height === 96 && Object.keys(style).length === 1) count += 1;
    children?.forEach(walk);
  };
  walk(screen.container);
  return count;
};

describe('RjsfPaperRendererDebug', () => {
  it('renders the form plus a JSON dump of the initial data', async () => {
    // act
    await renderWithProviders(<RjsfPaperRendererDebug i18n={testI18n} schema={schema} formData={{ name: 'Ann' }} />);

    // assert
    expect(screen.getByText('formDemo.formDataLabel')).toBeOnTheScreen();
    expect(screen.getByDisplayValue('Ann')).toBeOnTheScreen();
    expect(allText()).toContain('{"name":"Ann"}');
  });

  it('dumps {} when formData is undefined', async () => {
    // act
    await renderWithProviders(<RjsfPaperRendererDebug i18n={testI18n} schema={schema} />);

    // assert
    expect(allText()).toContain('formDemo.formDataLabel{}');
  });

  it('updates the dump on change and forwards onChange', async () => {
    // arrange
    const onChange = jest.fn();
    await renderWithProviders(
      <RjsfPaperRendererDebug i18n={testI18n} schema={schema} formData={{ name: 'Ann' }} onChange={onChange} />
    );

    // act
    await fireEvent.changeText(screen.getByDisplayValue('Ann'), 'Bob');

    // assert
    expect(allText()).toContain('{"name":"Bob"}');
    expect(onChange).toHaveBeenLastCalledWith(expect.objectContaining({ formData: { name: 'Bob' } }), 'root_name');
  });

  it('resets the dump when the caller passes formData with different content', async () => {
    // arrange
    const ui = (formData: Record<string, unknown>) => (
      <RjsfPaperRendererDebug i18n={testI18n} schema={schema} formData={formData} />
    );
    const { rerender } = await renderWithProviders(ui({ name: 'Ann' }));
    await fireEvent.changeText(screen.getByDisplayValue('Ann'), 'Bob');

    // act
    await rerender(ui({ name: 'Zed' }));

    // assert
    expect(allText()).toContain('{"name":"Zed"}');
  });

  it('keeps the edited dump when the caller passes a new but JSON-equal formData object', async () => {
    // arrange
    const ui = (formData: Record<string, unknown>) => (
      <RjsfPaperRendererDebug i18n={testI18n} schema={schema} formData={formData} />
    );
    const { rerender } = await renderWithProviders(ui({ name: 'Ann' }));
    await fireEvent.changeText(screen.getByDisplayValue('Ann'), 'Bob');

    // act
    await rerender(ui({ name: 'Ann' }));

    // assert
    expect(allText()).toContain('{"name":"Bob"}');
  });
});
