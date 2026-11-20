import { createRjsfValidator, translateRjsfString } from '@lichens-innovation/ts-common/rjsf';
import type { FormProps, IChangeEvent } from '@rjsf/core';
import { getDefaultRegistry } from '@rjsf/core';
import type { RJSFSchema } from '@rjsf/utils';
import { i18n } from 'i18next';
import type { FunctionComponent } from 'react';
import { useCallback, useEffect, useMemo, useRef } from 'react';
import { View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { logger } from '../../logger';
import { withCoalescingTheme } from './coalescing-form';
import { SubmitButtonOptionsContext } from './form-submit-context';
import { PAPER_TEMPLATES } from './rjsf-paper-templates';
import { RJSF_PAPER_THEME } from './rjsf-paper-theme';
import { RootFormDataContext, type RootFormDataStore, type RootFormSnapshot } from './root-form-data-context';
import { sanitizeSchemaTypes } from './sanitize-schema-types';
import { sanitizeUiOrder } from './sanitize-ui-order';
import { UNKNOWN_WIDGET, sanitizeUiWidgets } from './sanitize-ui-widgets';
import { UnknownWidget } from './widgets/unknown-widget';

// Changes still waiting in rjsf's queue are merged: a long text field that falls behind no longer crashes the
// sheet with "Maximum update depth exceeded" (SPOTD-1346).
const ThemedForm = withCoalescingTheme(RJSF_PAPER_THEME);

/**
 * rjsf's own widgets the Paper theme does not replace. They draw web DOM (`<input>`) and crash React
 * Native, so every default widget the theme does not override shows the notice instead (SPOTD-1346):
 * Email, URL, Color, File, AltDate, AltDateTime and Rating, which the aliases `email`, `uri`, `color`,
 * `file`, `data-url`, `alt-date` and `alt-datetime` resolve to.
 */
const WEB_ONLY_WIDGETS = Object.fromEntries(
  Object.keys(getDefaultRegistry().widgets)
    .filter((name) => !(name in (RJSF_PAPER_THEME.widgets ?? {})))
    .map((name) => [name, UnknownWidget])
);

export type FormData = Record<string, unknown>;

// One validator per language for the whole app session (rec 24.E). A validator keeps every schema it
// compiles, and compiling a 155-field checklist cost 0.85 s on a recent Android, 1.9 s on an old one:
// a validator per form opening paid it again on every save. rjsf's own default validator is a
// module-level singleton for the same reason.
type RjsfValidator = ReturnType<typeof createRjsfValidator>;

const validatorsByLanguage = new Map<string, RjsfValidator>();

/**
 * `validator`, handed schemas AJV can compile: a `type` JSON Schema does not define (`"drawing"`) made AJV
 * reject the whole schema, and the sheet could never be saved (SPOTD-1346). The form still draws from the
 * original schema.
 */
const withCompilableSchemas = (validator: RjsfValidator): RjsfValidator => {
  const wrapped: RjsfValidator = Object.create(validator);
  wrapped.validateFormData = (formData, schema, ...rest) =>
    validator.validateFormData(formData, sanitizeSchemaTypes(schema), ...rest);
  wrapped.isValid = (schema, formData, rootSchema) =>
    validator.isValid(sanitizeSchemaTypes(schema), formData, sanitizeSchemaTypes(rootSchema));
  wrapped.rawValidation = (schema, formData) => validator.rawValidation(sanitizeSchemaTypes(schema), formData);
  return wrapped;
};

/** The shared validator for `language`, created on first use. */
export const getRjsfValidator = (language: string): RjsfValidator => {
  let validator = validatorsByLanguage.get(language);
  if (!validator) {
    validator = withCompilableSchemas(createRjsfValidator(language));
    validatorsByLanguage.set(language, validator);
  }
  return validator;
};

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
  uiSchema: uiSchemaProp,
  ...rest
}) => {
  // The shared validator keeps AJV's schema cache and RJSF's schemaUtils/retrieveSchema cache warm
  // across keystrokes and across openings — critical for forms with conditional (if/then) fields.
  const customValidator = useMemo(() => getRjsfValidator(i18n.language), [i18n.language]);
  const insets = useSafeAreaInsets();

  // Live form data is kept in a ref and published through a stable store, never in state: a setState
  // here re-renders this component, which hands `Form` a fresh props object and costs a whole-schema
  // deep compare on every keystroke (SPOTD-621).
  const listenersRef = useRef(new Set<() => void>());
  const snapshotRef = useRef<RootFormSnapshot>({ data: formDataProp, live: new Map() });

  // Iterates a copy: a listener that unsubscribes while being notified would otherwise mutate the Set
  // mid-iteration.
  const emit = useCallback(() => {
    for (const listener of [...listenersRef.current]) {
      listener();
    }
  }, []);

  const store = useMemo<RootFormDataStore>(
    () => ({
      getSnapshot: () => snapshotRef.current,
      subscribe: (listener) => {
        listenersRef.current.add(listener);

        return () => {
          listenersRef.current.delete(listener);
        };
      },
      setLiveValue: (fieldId, slug, value) => {
        const { data, live } = snapshotRef.current;
        const existing = live.get(fieldId);

        if (existing && existing.value === value) return;

        const nextLive = new Map(live);
        nextLive.set(fieldId, { slug, value });
        snapshotRef.current = { data, live: nextLive };
        emit();
      },
      clearLiveValue: (fieldId) => {
        const { data, live } = snapshotRef.current;

        if (!live.has(fieldId)) return;

        const nextLive = new Map(live);
        nextLive.delete(fieldId);
        snapshotRef.current = { data, live: nextLive };
        emit();
      },
    }),
    [emit]
  );

  // A genuine `formData` change from the caller is a new baseline: re-seed the snapshot and drop
  // every live entry, which now describes the previous data. A no-op at mount, since the ref starts
  // at this same prop.
  const seededRef = useRef(formDataProp);

  useEffect(() => {
    if (seededRef.current === formDataProp) return;

    seededRef.current = formDataProp;
    snapshotRef.current = { data: formDataProp, live: new Map() };
    emit();
  }, [formDataProp, emit]);

  const mergedWidgets = useMemo(
    () => ({
      ...WEB_ONLY_WIDGETS,
      ...(RJSF_PAPER_THEME.widgets ?? {}),
      ...(widgets ?? {}),
      [UNKNOWN_WIDGET]: UnknownWidget,
    }),
    [widgets]
  );

  // A broken `ui:order` makes rjsf throw and draw the error with web DOM, which crashes the whole sheet
  // (SPOTD-1300). Repaired here, once per template: the caller hands a stable uiSchema, schema and widgets.
  const { schema } = rest;
  const uiSchema = useMemo(() => {
    const { uiSchema: sanitized, repairs } = sanitizeUiOrder(uiSchemaProp, schema);
    for (const { path, missing, duplicateWildcards } of repairs) {
      logger.warn(
        `[rjsf] ui:order at ${path} repaired: missing ${JSON.stringify(missing)}, extra "*" dropped: ${duplicateWildcards}`
      );
    }
    // A widget name the app does not know makes rjsf's getWidget throw (SPOTD-1346): it is renamed to
    // UnknownWidget, which shows the "can't be displayed" notice.
    return sanitizeUiWidgets(sanitized, Object.keys(mergedWidgets));
  }, [uiSchemaProp, schema, mergedWidgets]);

  const mergedTemplates = useMemo(
    () => ({
      ...(RJSF_PAPER_THEME.templates ?? {}),
      ...PAPER_TEMPLATES,
      ...(templates ?? {}),
    }),
    [templates]
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
      const nextData = data.formData;
      const { live } = snapshotRef.current;
      let nextLive = live;

      // Retire only the live entries rjsf has caught up on. Dropping them all would repaint an older
      // value whenever the cycle for one keystroke lands after the next keystroke was published.
      if (live.size > 0) {
        const converged = [...live].filter(([, entry]) => nextData?.[entry.slug] === entry.value);

        if (converged.length > 0) {
          const pruned = new Map(live);

          for (const [fieldId] of converged) {
            pruned.delete(fieldId);
          }

          nextLive = pruned;
        }
      }

      snapshotRef.current = { data: nextData, live: nextLive };
      emit();
      onChangeProp?.(data, id);
    },
    [emit, onChangeProp]
  );

  // Root form data reaches the fields that need it (e.g. ComputedField) through the store in
  // RootFormDataContext below — deliberately kept OUT of formContext so this object stays
  // referentially stable across keystrokes. Injecting the changing formData here would hand a fresh
  // registry to the entire field tree on every change and defeat any per-widget memoization.
  const mergedFormContext = useMemo(() => ({ ...(formContextProp ?? {}) }), [formContextProp]);

  return (
    <SubmitButtonOptionsContext.Provider value={{ submitButtonAbsolutePosition, submitButtonOverrideLabel }}>
      <RootFormDataContext.Provider value={store}>
        <ThemedForm
          {...rest}
          uiSchema={uiSchema}
          key={i18n.language}
          // The caller's own object, not a mirrored copy: a stable `formData` prop keeps rjsf's
          // getSnapshotBeforeUpdate path (whole-props deep compare + a second getStateFromProps)
          // off the keystroke path, and a real prop change still reaches Form as before.
          formData={formDataProp}
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
