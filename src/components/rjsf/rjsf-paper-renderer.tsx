import { translateRjsfString, useRjsfValidator } from '@lichens-innovation/ts-common/rjsf';
import type { FormProps, IChangeEvent } from '@rjsf/core';
import { withTheme } from '@rjsf/core';
import type { RJSFSchema } from '@rjsf/utils';
import { i18n } from 'i18next';
import type { FunctionComponent } from 'react';
import { useEffect, useMemo, useState } from 'react';
import { PAPER_TEMPLATES } from './rjsf-paper-templates';
import { RJSF_PAPER_THEME } from './rjsf-paper-theme';

const ThemedForm = withTheme(RJSF_PAPER_THEME);

export type FormData = Record<string, unknown>;

type FormTemplates = FormProps<FormData, RJSFSchema>['templates'];
type FormWidgets = FormProps<FormData, RJSFSchema>['widgets'];
type FormFields = FormProps<FormData, RJSFSchema>['fields'];

export type RjsfPaperRendererProps = Omit<
  FormProps<FormData, RJSFSchema>,
  'validator' | 'templates' | 'widgets' | 'fields'
> & {
  i18n: i18n;
  templates?: FormTemplates;
  widgets?: FormWidgets;
  fields?: FormFields;
};

export const RjsfPaperRenderer: FunctionComponent<RjsfPaperRendererProps> = ({
  i18n,
  formData: formDataProp,
  onChange: onChangeProp,
  templates,
  widgets,
  fields,
  ...rest
}) => {
  const customValidator = useRjsfValidator(i18n.language);
  const [localFormData, setLocalFormData] = useState<FormData | undefined>(formDataProp);

  useEffect(() => {
    setLocalFormData(formDataProp);
  }, [formDataProp]);

  const mergedTemplates = useMemo(
    () => ({
      ...(RJSF_PAPER_THEME.templates ?? {}),
      ...PAPER_TEMPLATES,
      ...(templates ?? {}),
    }),
    [templates]
  );

  const mergedWidgets = useMemo(
    () => ({
      ...(RJSF_PAPER_THEME.widgets ?? {}),
      ...(widgets ?? {}),
    }),
    [widgets]
  );

  const mergedFields = useMemo(
    () => ({
      ...(RJSF_PAPER_THEME.fields ?? {}),
      ...(fields ?? {}),
    }),
    [fields]
  );

  const handleChange = (data: IChangeEvent<FormData, RJSFSchema>, id?: string) => {
    setLocalFormData(data.formData);
    onChangeProp?.(data, id);
  };

  return (
    <ThemedForm
      {...rest}
      key={i18n.language}
      formData={localFormData}
      onChange={handleChange}
      templates={mergedTemplates as unknown as FormTemplates}
      widgets={mergedWidgets as unknown as FormWidgets}
      fields={mergedFields as unknown as FormFields}
      validator={customValidator}
      translateString={(stringToTranslate, params) => translateRjsfString({ stringToTranslate, params, i18n })}
    />
  );
};
