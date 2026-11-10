import { createRjsfValidator, translateRjsfString } from '@lichens-innovation/ts-common/rjsf';
import { withTheme, type FormProps, type IChangeEvent } from '@rjsf/core';
import type { RJSFSchema } from '@rjsf/utils';
import { i18n } from 'i18next';
import { useCallback, useMemo, type FunctionComponent } from 'react';
import { View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { SubmitButtonOptionsContext } from './form-submit-context';
import { RJSF_PAPER_THEME } from './rjsf-paper-theme';
import {
  mergePaperFields,
  mergePaperTemplates,
  mergePaperWidgets,
  type FormFields,
  type FormTemplates,
  type FormWidgets,
} from './rjsf-paper-renderer.utils';
import { RootFormDataContext } from './root-form-data-context';
import { useLiveRootFormDataStore } from './use-live-root-form-data-store';

const ThemedForm = withTheme(RJSF_PAPER_THEME);

const EMPTY_FORM_CONTEXT = {};

export type FormData = Record<string, unknown>;

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
  /** habit-hooks-disable non-essential-comment
   * Memoized here (React layer) so ts-common stays React-free. A stable validator keeps AJV's schema
   * cache and RJSF's schemaUtils/retrieveSchema cache warm across keystrokes — critical for forms with
   * conditional (if/then) fields.
   */
  const customValidator = useMemo(() => createRjsfValidator(i18n.language), [i18n.language]);
  const insets = useSafeAreaInsets();
  const store = useLiveRootFormDataStore(formDataProp);

  const mergedTemplates = useMemo(() => mergePaperTemplates(templates), [templates]);
  const mergedWidgets = useMemo(() => mergePaperWidgets(widgets), [widgets]);
  const mergedFields = useMemo(() => mergePaperFields(fields), [fields]);

  const handleChange = useCallback(
    (data: IChangeEvent<FormData, RJSFSchema>, id?: string) => {
      store.acceptFormData(data.formData);
      onChangeProp?.(data, id);
    },
    [store, onChangeProp]
  );

  /** habit-hooks-disable non-essential-comment
   * Root form data reaches the fields that need it (e.g. ComputedField) through the store in
   * RootFormDataContext — deliberately kept OUT of formContext so this object stays referentially
   * stable across keystrokes. Injecting the changing formData here would hand a fresh registry to the
   * entire field tree on every change and defeat any per-widget memoization.
   */
  const formContext = formContextProp ?? EMPTY_FORM_CONTEXT;

  return (
    <SubmitButtonOptionsContext.Provider value={{ submitButtonAbsolutePosition, submitButtonOverrideLabel }}>
      <RootFormDataContext.Provider value={store}>
        <ThemedForm
          {...rest}
          key={i18n.language}
          /** habit-hooks-disable non-essential-comment
           * The caller's own object, not a mirrored copy: a stable `formData` prop keeps rjsf's
           * getSnapshotBeforeUpdate path (whole-props deep compare + a second getStateFromProps) off the
           * keystroke path, and a real prop change still reaches Form as before.
           */
          formData={formDataProp}
          onChange={handleChange}
          templates={mergedTemplates}
          widgets={mergedWidgets}
          fields={mergedFields}
          formContext={formContext}
          validator={customValidator}
          translateString={(stringToTranslate, params) => translateRjsfString({ stringToTranslate, params, i18n })}
        />
        {/* The submit button floats over the form as an absolutely-positioned
            FAB, so it no longer reserves space in the scroll flow. Add a footer
            spacer (FAB height + its bottom offset + safe-area inset) so the last
            fields can scroll clear of the FAB instead of sitting under it. */}
        {submitButtonAbsolutePosition && <View style={{ height: insets.bottom + 96 }} />}
      </RootFormDataContext.Provider>
    </SubmitButtonOptionsContext.Provider>
  );
};
