import type { UiSchema } from '@rjsf/utils';

/** The registry name every unknown widget is renamed to. Registered by `RjsfPaperRenderer`. */
export const UNKNOWN_WIDGET = 'UnknownWidget';

/** The `ui:options` key that keeps the widget name the template asked for, for the notice's log. */
export const UNKNOWN_WIDGET_NAME_OPTION = 'unknownWidgetName';

/**
 * rjsf's own aliases (`getWidget`'s `widgetMap`, not exported): a name rjsf turns into a registry name for
 * the field's type, such as `textarea` → `TextareaWidget`. They are known even though no registry key
 * spells them.
 */
const RJSF_WIDGET_ALIASES = [
  'alt-date',
  'alt-datetime',
  'checkbox',
  'checkboxes',
  'color',
  'data-url',
  'date',
  'date-time',
  'datetime',
  'email',
  'file',
  'files',
  'hidden',
  'hostname',
  'ipv4',
  'ipv6',
  'password',
  'radio',
  'range',
  'select',
  'text',
  'textarea',
  'time',
  'updown',
  'uri',
];

const isRecord = (value: unknown): value is Record<string, unknown> =>
  typeof value === 'object' && value !== null && !Array.isArray(value);

const sanitizeNode = (uiSchema: UiSchema, isKnown: (name: string) => boolean): UiSchema => {
  let result = uiSchema;
  const set = (key: string, value: unknown) => {
    if (result === uiSchema) result = { ...uiSchema };
    result[key] = value;
  };

  const options = isRecord(uiSchema['ui:options']) ? uiSchema['ui:options'] : undefined;
  // `ui:widget` wins over `ui:options.widget` when both are set, as in rjsf's `getUiOptions`.
  const widget = uiSchema['ui:widget'] ?? options?.widget;
  if (typeof widget === 'string' && !isKnown(widget)) {
    set('ui:widget', UNKNOWN_WIDGET);
    set('ui:options', { ...options, widget: UNKNOWN_WIDGET, [UNKNOWN_WIDGET_NAME_OPTION]: widget });
  }

  for (const [key, value] of Object.entries(uiSchema)) {
    if (key.startsWith('ui:') || !isRecord(value)) continue;
    const child = sanitizeNode(value as UiSchema, isKnown);
    if (child !== value) set(key, child);
  }

  return result;
};

/**
 * Renames every `ui:widget` the app has no widget for to {@link UNKNOWN_WIDGET}, before rjsf sees it
 * (SPOTD-1346).
 *
 * rjsf's `getWidget` throws on a name it cannot resolve (`No widget 'ApiDropdownWidget' for type 'string'`),
 * which takes the whole sheet down. The web form builder writes widgets mobile does not have
 * (`ApiDropdownWidget`, `PhotoWidget`), so the name is checked here against `registeredNames` and rjsf's
 * aliases. A registry wrapper cannot do it: rjsf copies the widget map with object spread on every render.
 *
 * The widget itself logs the name, once per mount. Pure and never mutates its input: the caller's own
 * object comes back when every widget is known.
 */
export const sanitizeUiWidgets = (
  uiSchema: UiSchema | undefined,
  registeredNames: Iterable<string>
): UiSchema | undefined => {
  if (!isRecord(uiSchema)) return uiSchema;

  const known = new Set([...registeredNames, ...RJSF_WIDGET_ALIASES]);
  return sanitizeNode(uiSchema, (name) => known.has(name));
};
