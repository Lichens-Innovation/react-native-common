import * as rjsf from '@lib/rjsf';

const { RJSF_PAPER_THEME } = rjsf;

describe('RJSF_PAPER_THEME.widgets', () => {
  it.each`
    key                          | widget
    ${'TextWidget'}              | ${rjsf.TextWidget}
    ${'TextareaWidget'}          | ${rjsf.TextareaWidget}
    ${'HiddenWidget'}            | ${rjsf.HiddenWidget}
    ${'password'}                | ${rjsf.PasswordWidget}
    ${'PasswordWidget'}          | ${rjsf.PasswordWidget}
    ${'date'}                    | ${rjsf.DateWidget}
    ${'DateWidget'}              | ${rjsf.DateWidget}
    ${'datetime'}                | ${rjsf.DateTimeWidget}
    ${'DateTimeWidget'}          | ${rjsf.DateTimeWidget}
    ${'time'}                    | ${rjsf.TimeWidget}
    ${'TimeWidget'}              | ${rjsf.TimeWidget}
    ${'select'}                  | ${rjsf.SelectWidget}
    ${'SelectWidget'}            | ${rjsf.SelectWidget}
    ${'radio'}                   | ${rjsf.RadioWidget}
    ${'RadioWidget'}             | ${rjsf.RadioWidget}
    ${'range'}                   | ${rjsf.RangeWidget}
    ${'RangeWidget'}             | ${rjsf.RangeWidget}
    ${'radioYesNo'}              | ${rjsf.RadioYesNoWidget}
    ${'RadioYesNoWidget'}        | ${rjsf.RadioYesNoWidget}
    ${'number'}                  | ${rjsf.NumberWidget}
    ${'updown'}                  | ${rjsf.NumberWidget}
    ${'NumberWidget'}            | ${rjsf.NumberWidget}
    ${'UpDownWidget'}            | ${rjsf.NumberWidget}
    ${'checkbox'}                | ${rjsf.CheckboxWidget}
    ${'CheckboxWidget'}          | ${rjsf.CheckboxWidget}
    ${'checkboxes'}              | ${rjsf.CheckboxesWidget}
    ${'CheckboxesWidget'}        | ${rjsf.CheckboxesWidget}
    ${'imageVideoGallery'}       | ${rjsf.ImageVideoGalleryWidget}
    ${'ImageVideoGalleryWidget'} | ${rjsf.ImageVideoGalleryWidget}
    ${'multiSelect'}             | ${rjsf.MultiSelectWidget}
    ${'MultiSelectWidget'}       | ${rjsf.MultiSelectWidget}
    ${'label'}                   | ${rjsf.LabelWidget}
    ${'LabelWidget'}             | ${rjsf.LabelWidget}
  `('maps "$key" to the exported widget', ({ key, widget }) => {
    expect(widget).toBeDefined();
    expect(RJSF_PAPER_THEME.widgets?.[key]).toBe(widget);
  });

  it('registers exactly the known widget keys', () => {
    expect(Object.keys(RJSF_PAPER_THEME.widgets ?? {})).toHaveLength(33);
  });
});
