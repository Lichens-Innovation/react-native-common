import { translateRjsfString, useRjsfValidator } from '@lichens-innovation/ts-common/rjsf';
import type { FormProps, IChangeEvent } from '@rjsf/core';
import { withTheme } from '@rjsf/core';
import type { RJSFSchema } from '@rjsf/utils';
import { i18n } from 'i18next';
import type { FunctionComponent } from 'react';
import { useCallback, useEffect, useMemo, useState } from 'react';
import { View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { SubmitButtonOptionsContext } from './form-submit-context';
import { PAPER_TEMPLATES } from './rjsf-paper-templates';
import { RJSF_PAPER_THEME } from './rjsf-paper-theme';
import { RootFormDataContext } from './root-form-data-context';

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
  submitButtonAbsolutePosition?: boolean;
  submitButtonOverrideLabel?: string | null;
};

export const RjsfPaperRenderer: FunctionComponent<RjsfPaperRendererProps> = ({
  i18n,
  formData: formDataProp,
  onChange: onChangeProp,
  templates,
  widgets,
  fields,
  formContext: formContextProp,
  submitButtonAbsolutePosition = false,
  submitButtonOverrideLabel = null,
  ...rest
}) => {
  const customValidator = useRjsfValidator(i18n.language);
  const insets = useSafeAreaInsets();
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

  const handleChange = useCallback(
    (data: IChangeEvent<FormData, RJSFSchema>, id?: string) => {
      setLocalFormData(data.formData);
      onChangeProp?.(data, id);
    },
    [onChangeProp]
  );

  // Root form data is delivered to the fields that need it (e.g. ComputedField)
  // via RootFormDataContext below — deliberately kept OUT of formContext so this
  // object stays referentially stable across keystrokes. Injecting the changing
  // formData here would hand a fresh registry to the entire field tree on every
  // change and defeat any per-widget memoization.
  const mergedFormContext = useMemo(() => ({ ...(formContextProp ?? {}) }), [formContextProp]);

  return (
    <SubmitButtonOptionsContext.Provider value={{ submitButtonAbsolutePosition, submitButtonOverrideLabel }}>
      <RootFormDataContext.Provider value={localFormData}>
        <ThemedForm
          {...rest}
          key={i18n.language}
          formData={localFormData}
          onChange={handleChange}
          templates={mergedTemplates as unknown as FormTemplates}
          widgets={mergedWidgets as unknown as FormWidgets}
          fields={mergedFields as unknown as FormFields}
          formContext={mergedFormContext}
          validator={customValidator}
          translateString={(stringToTranslate, params) => translateRjsfString({ stringToTranslate, params, i18n })}
        />
        {/* The submit button floats over the form as an absolutely-positioned
            FAB, so it no longer reserves space in the scroll flow. Add a footer
            spacer (FAB height + its bottom offset + safe-area inset) so the last
            fields can scroll clear of the FAB instead of sitting under it. */}
        {submitButtonAbsolutePosition ? <View style={{ height: insets.bottom + 96 }} /> : null}
      </RootFormDataContext.Provider>
    </SubmitButtonOptionsContext.Provider>
  );
};
