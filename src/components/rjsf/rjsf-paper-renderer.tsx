import { createRjsfValidator, translateRjsfString } from '@lichens-innovation/ts-common/rjsf';
import type { FormProps, IChangeEvent } from '@rjsf/core';
import { withTheme } from '@rjsf/core';
import type { RJSFSchema } from '@rjsf/utils';
import { i18n } from 'i18next';
import type { FunctionComponent } from 'react';
import { useCallback, useEffect, useMemo, useRef } from 'react';
import { View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { SubmitButtonOptionsContext } from './form-submit-context';
import { PAPER_TEMPLATES } from './rjsf-paper-templates';
import { RJSF_PAPER_THEME } from './rjsf-paper-theme';
import { RootFormDataContext, type RootFormDataStore, type RootFormSnapshot } from './root-form-data-context';

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
  // Memoize the AJV validator here (React layer) so ts-common stays React-free.
  // A stable validator keeps AJV's schema cache and RJSF's schemaUtils/retrieveSchema
  // cache warm across keystrokes — critical for forms with conditional (if/then) fields.
  const customValidator = useMemo(() => createRjsfValidator(i18n.language), [i18n.language]);
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
