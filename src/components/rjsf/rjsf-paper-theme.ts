import type { ThemeProps } from '@rjsf/core';
import { RjsfPaperFormWrapper } from './form-submit-context';
import {
  CheckboxWidget,
  CheckboxesWidget,
  DateTimeWidget,
  DateWidget,
  HiddenWidget,
  NumberWidget,
  PasswordWidget,
  RadioWidget,
  RangeWidget,
  SelectWidget,
  TextWidget,
  TextareaWidget,
} from './widgets';

export const RJSF_PAPER_THEME: ThemeProps = {
  widgets: {
    TextWidget,
    TextareaWidget,
    HiddenWidget,
    password: PasswordWidget,
    PasswordWidget,
    date: DateWidget,
    DateWidget,
    datetime: DateTimeWidget,
    DateTimeWidget,
    select: SelectWidget,
    SelectWidget,
    radio: RadioWidget,
    RadioWidget,
    range: RangeWidget,
    RangeWidget,
    number: NumberWidget,
    updown: NumberWidget,
    NumberWidget,
    UpDownWidget: NumberWidget,
    checkbox: CheckboxWidget,
    CheckboxWidget,
    checkboxes: CheckboxesWidget,
    CheckboxesWidget,
  },
  // Form passes onSubmit, children, className, etc. Our wrapper accepts View props + onSubmit.
  _internalFormWrapper: RjsfPaperFormWrapper as ThemeProps['_internalFormWrapper'],
};
