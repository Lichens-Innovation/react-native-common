import type { RJSFSchema, UiSchema } from '@rjsf/utils';

/** One `ui:order` that had to be repaired before rjsf could draw the form. */
export type UiOrderRepair = {
  /** Where the order sits: `root`, then each property name down to it (`root.section.items`). */
  path: string;
  /** Fields the schema declares (conditional ones included) that the order did not name. */
  missing: string[];
  /** How many extra `*` were dropped. rjsf throws on more than one. */
  duplicateWildcards: number;
};

export type SanitizedUiOrder = {
  /** The uiSchema to hand rjsf: the caller's own object when nothing needed changing. */
  uiSchema: UiSchema | undefined;
  /** The repairs worth reporting. Adding a `*` to a complete order is not one. */
  repairs: UiOrderRepair[];
};

type SchemaNode = RJSFSchema | boolean | undefined;
type PropertyMap = Record<string, SchemaNode>;

const WILDCARD = '*';
const isRecord = (value: unknown): value is Record<string, unknown> =>
  typeof value === 'object' && value !== null && !Array.isArray(value);

const asSchemaList = (value: unknown): SchemaNode[] => (Array.isArray(value) ? (value as SchemaNode[]) : []);

/**
 * Every property an object schema can show, including those only an `if/then`, an `allOf`/`anyOf`/`oneOf`
 * branch or a `dependencies` entry adds: rjsf orders the resolved schema, so those need a slot too.
 */
const collectProperties = (schema: SchemaNode, into: PropertyMap = {}): PropertyMap => {
  if (!isRecord(schema)) return into;

  Object.assign(into, isRecord(schema.properties) ? schema.properties : {});
  const branches = [
    ...asSchemaList(schema.allOf),
    ...asSchemaList(schema.anyOf),
    ...asSchemaList(schema.oneOf),
    schema.then,
    schema.else,
    ...(isRecord(schema.dependencies) ? Object.values(schema.dependencies) : []),
  ];
  for (const branch of branches) collectProperties(branch as SchemaNode, into);

  return into;
};

/** The repaired order and what was wrong with it, or null when the order is usable as it is. */
const repairOrder = (order: string[], properties: PropertyMap) => {
  const wildcards = order.filter((name) => name === WILDCARD).length;
  if (wildcards === 1) return null;

  const listed = new Set(order);
  const missing = wildcards === 0 ? Object.keys(properties).filter((name) => !listed.has(name)) : [];
  const named = order.filter((name) => name !== WILDCARD);
  // The first `*` stays where the author put it and the extras go; a missing one goes last, so unlisted
  // fields follow the rest.
  const firstWildcard = order.indexOf(WILDCARD);
  const repaired =
    firstWildcard === -1
      ? [...named, WILDCARD]
      : [...order.slice(0, firstWildcard + 1), ...order.slice(firstWildcard + 1).filter((n) => n !== WILDCARD)];

  return { repaired, missing, duplicateWildcards: Math.max(wildcards - 1, 0) };
};

/** The schema a nested uiSchema key describes: a property, or the array's `items`. */
const childSchema = (key: string, schema: SchemaNode, properties: PropertyMap): SchemaNode => {
  if (key in properties) return properties[key];
  return key === 'items' && isRecord(schema) && isRecord(schema.items) ? (schema.items as RJSFSchema) : undefined;
};

const sanitizeNode = (uiSchema: UiSchema, schema: SchemaNode, path: string, repairs: UiOrderRepair[]): UiSchema => {
  const properties = collectProperties(schema);
  let result = uiSchema;
  const set = (key: string, value: unknown) => {
    if (result === uiSchema) result = { ...uiSchema };
    result[key] = value;
  };

  const order = uiSchema['ui:order'];
  const fix = Array.isArray(order) ? repairOrder(order as string[], properties) : null;
  if (fix) {
    set('ui:order', fix.repaired);
    if (fix.missing.length > 0 || fix.duplicateWildcards > 0) {
      repairs.push({ path, missing: fix.missing, duplicateWildcards: fix.duplicateWildcards });
    }
  }

  for (const [key, value] of Object.entries(uiSchema)) {
    if (key.startsWith('ui:') || !isRecord(value)) continue;
    const child = sanitizeNode(value as UiSchema, childSchema(key, schema, properties), `${path}.${key}`, repairs);
    if (child !== value) set(key, child);
  }

  return result;
};

/**
 * Repairs every `ui:order` in `uiSchema` that would make rjsf throw, before rjsf sees it (SPOTD-1300).
 *
 * rjsf's `orderProperties` throws when an order without `*` misses a field, or holds more than one `*`,
 * and `ObjectField` then draws the error with web DOM that crashes React Native. The throw is hard-coded
 * in `ObjectField`, not a theme template, so the order has to be right before render:
 * - an order without `*` gets one at the end, so unlisted fields show last;
 * - only the first `*` is kept.
 *
 * Names the schema does not declare are left alone: rjsf already ignores them. Pure and never mutates
 * its input: the caller's own object comes back only when every order already holds exactly one `*`
 * (or there is none); otherwise a copy, with a complete order closed by `*` without being reported.
 */
export const sanitizeUiOrder = (uiSchema: UiSchema | undefined, schema: RJSFSchema): SanitizedUiOrder => {
  if (!isRecord(uiSchema)) return { uiSchema, repairs: [] };

  const repairs: UiOrderRepair[] = [];
  return { uiSchema: sanitizeNode(uiSchema, schema, 'root', repairs), repairs };
};
