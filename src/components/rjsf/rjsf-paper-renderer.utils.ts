import type { FormProps } from '@rjsf/core';
import type { RJSFSchema } from '@rjsf/utils';
import { RJSF_PAPER_THEME } from './rjsf-paper-theme';
import { PAPER_TEMPLATES } from './rjsf-paper-templates';

type FormDataRecord = Record<string, unknown>;
type PaperFormProps = FormProps<FormDataRecord, RJSFSchema>;

export type FormTemplates = PaperFormProps['templates'];
export type FormWidgets = PaperFormProps['widgets'];
export type FormFields = PaperFormProps['fields'];

export const mergePaperTemplates = (templates?: FormTemplates): FormTemplates =>
  ({
    ...(RJSF_PAPER_THEME.templates ?? {}),
    ...PAPER_TEMPLATES,
    ...(templates ?? {}),
  }) as unknown as FormTemplates;

export const mergePaperWidgets = (widgets?: FormWidgets): FormWidgets =>
  ({
    ...(RJSF_PAPER_THEME.widgets ?? {}),
    ...(widgets ?? {}),
  }) as unknown as FormWidgets;

export const mergePaperFields = (fields?: FormFields): FormFields =>
  ({
    ...(RJSF_PAPER_THEME.fields ?? {}),
    ...(fields ?? {}),
  }) as unknown as FormFields;
