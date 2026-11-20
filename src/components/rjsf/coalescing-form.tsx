import Form, { type FormProps, type ThemeProps } from '@rjsf/core';
import type { FieldPathList, RJSFSchema } from '@rjsf/utils';
import { forwardRef } from 'react';

type FormData = Record<string, unknown>;

/** Whether `a` starts with every segment of `b`: a change at `b` replaces what sits at `a`. */
const startsWith = (a: FieldPathList, b: FieldPathList) => b.every((segment, index) => segment === a[index]);

/**
 * The waiting change a new change at `path` can replace: the latest one for the same field, as long as no
 * change between them touches that field, a field inside it or one around it. Changes to separate fields
 * commute, so merging past them keeps the result. -1 when there is none.
 */
export const mergeableIndex = (queue: { path: FieldPathList }[], path: FieldPathList) => {
  // Index 0 is being applied: never touched.
  for (let index = queue.length - 1; index > 0; index--) {
    const waiting = queue[index].path;
    const nested = startsWith(waiting, path);
    if (nested && waiting.length === path.length) return index;
    if (nested || startsWith(path, waiting)) return -1;
  }
  return -1;
};

/**
 * rjsf's `Form`, with field changes that are still waiting in its queue merged (SPOTD-1346).
 *
 * `Form` queues every change and applies the next one from the previous one's `setState` callback, which
 * runs while React commits. Each queued change is therefore a nested update, and React throws "Maximum
 * update depth exceeded" past 50 of them. A long text field falls behind on Android and the keystrokes
 * pile up in a single batch, enough to cross that line and take the sheet down.
 *
 * A change for a field that already has one waiting replaces it instead of queueing behind it: the waiting
 * one had not been applied yet and the new value supersedes it, so nothing is lost. The queue then holds
 * at most one waiting change per field besides the one being applied, as long as the changes do not
 * overlap: a change to a field and one to a field inside it (`rows` and `rows.0`) are queued apart.
 */
export class CoalescingForm extends Form<FormData, RJSFSchema> {
  constructor(props: FormProps<FormData, RJSFSchema>) {
    super(props);
    const enqueueChange = this.onChange;

    this.onChange = (newValue, path, newErrorSchema, id) => {
      const index = mergeableIndex(this.pendingChanges, path);
      if (index > 0) {
        this.pendingChanges[index] = { newValue, path, newErrorSchema, id };
        return;
      }
      enqueueChange(newValue, path, newErrorSchema, id);
    };
  }
}

/** rjsf's `withTheme`, built on {@link CoalescingForm}: the theme's registries under the caller's. */
export const withCoalescingTheme = (theme: ThemeProps) =>
  forwardRef<Form<FormData, RJSFSchema>, FormProps<FormData, RJSFSchema>>(
    ({ fields, widgets, templates, ...props }, ref) => (
      <CoalescingForm
        {...theme}
        {...props}
        ref={ref}
        fields={{ ...theme.fields, ...fields }}
        widgets={{ ...theme.widgets, ...widgets }}
        templates={{
          ...theme.templates,
          ...templates,
          ButtonTemplates: { ...theme.templates?.ButtonTemplates, ...templates?.ButtonTemplates },
        }}
      />
    )
  );
