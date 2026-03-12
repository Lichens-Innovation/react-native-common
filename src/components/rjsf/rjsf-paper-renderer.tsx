import { translateRjsfString, useRjsfValidator } from '@lichens-innovation/ts-common/rjsf';
import type { FormProps, IChangeEvent } from '@rjsf/core';
import { withTheme } from '@rjsf/core';
import type { RJSFSchema } from '@rjsf/utils';
import type { FunctionComponent } from 'react';
import { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { PAPER_TEMPLATES } from './rjsf-paper-templates';
import { RJSF_PAPER_THEME } from './rjsf-paper-theme';

const ThemedForm = withTheme(RJSF_PAPER_THEME);

type FormTemplates = FormProps<FormData, RJSFSchema>['templates'];

export type FormData = Record<string, unknown>;

export type RjsfPaperRendererProps = Omit<FormProps<FormData, RJSFSchema>, 'validator'>;

export const RjsfPaperRenderer: FunctionComponent<RjsfPaperRendererProps> = ({
  formData: formDataProp,
  onChange: onChangeProp,
  uiSchema = {},
  ...rest
}) => {
  const { t, i18n } = useTranslation();
  const customValidator = useRjsfValidator();
  const [localFormData, setLocalFormData] = useState<FormData | undefined>(formDataProp);

  useEffect(() => {
    setLocalFormData(formDataProp);
  }, [formDataProp]);

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
      templates={PAPER_TEMPLATES as unknown as FormTemplates}
      validator={customValidator}
      translateString={(stringToTranslate, params) => translateRjsfString({ stringToTranslate, params })}
      uiSchema={{
        ...uiSchema,
        'ui:submitButtonOptions': { submitText: t('rjsf:submit') },
      }}
    />
  );
};
