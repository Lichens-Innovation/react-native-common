import type { RJSFSchema } from '@rjsf/utils';

const JSON_TYPES = new Set(['string', 'number', 'integer', 'boolean', 'object', 'array', 'null']);

/** Keywords whose value is one schema. */
const SCHEMA_KEYWORDS = [
  'additionalItems',
  'additionalProperties',
  'contains',
  'else',
  'if',
  'items',
  'not',
  'propertyNames',
  'then',
  'unevaluatedItems',
  'unevaluatedProperties',
];
/** Keywords whose value is a list of schemas (`items` too, in its tuple form). */
const SCHEMA_LIST_KEYWORDS = ['allOf', 'anyOf', 'items', 'oneOf', 'prefixItems'];
/** Keywords whose value maps names to schemas. */
const SCHEMA_MAP_KEYWORDS = [
  '$defs',
  'definitions',
  'dependencies',
  'dependentSchemas',
  'patternProperties',
  'properties',
];

const isRecord = (value: unknown): value is Record<string, unknown> =>
  typeof value === 'object' && value !== null && !Array.isArray(value);

/** The `type` with every name JSON Schema does not define dropped; undefined when none is left. */
const validType = (type: unknown) => {
  if (typeof type === 'string') return JSON_TYPES.has(type) ? type : undefined;
  if (!Array.isArray(type)) return type;
  const kept = type.filter((name) => JSON_TYPES.has(name));
  if (kept.length === type.length) return type;
  return kept.length > 0 ? kept : undefined;
};

const cache = new WeakMap<object, unknown>();

const sanitizeNode = (node: unknown): unknown => {
  if (Array.isArray(node)) {
    const next = node.map(sanitizeNode);
    return next.every((item, index) => item === node[index]) ? node : next;
  }
  if (!isRecord(node)) return node;

  const cached = cache.get(node);
  if (cached) return cached;

  let result = node;
  const set = (key: string, value: unknown) => {
    if (result === node) result = { ...node };
    if (value === undefined) delete result[key];
    else result[key] = value;
  };

  if ('type' in node) {
    const type = validType(node.type);
    if (type !== node.type) set('type', type);
  }
  for (const key of SCHEMA_KEYWORDS) {
    if (!isRecord(node[key])) continue;
    const child = sanitizeNode(node[key]);
    if (child !== node[key]) set(key, child);
  }
  for (const key of SCHEMA_LIST_KEYWORDS) {
    if (!Array.isArray(node[key])) continue;
    const child = sanitizeNode(node[key]);
    if (child !== node[key]) set(key, child);
  }
  for (const key of SCHEMA_MAP_KEYWORDS) {
    const map = node[key];
    if (!isRecord(map)) continue;
    let nextMap = map;
    for (const [name, value] of Object.entries(map)) {
      const child = sanitizeNode(value);
      if (child === value) continue;
      if (nextMap === map) nextMap = { ...map };
      nextMap[name] = child;
    }
    if (nextMap !== map) set(key, nextMap);
  }

  cache.set(node, result);
  return result;
};

/**
 * The schema AJV can compile: every `type` JSON Schema does not define (`"drawing"`) removed (SPOTD-1346).
 *
 * AJV rejects the whole schema over one such type, so a sheet holding it could never be saved: every
 * validation returned the compile error. rjsf still draws from the original schema, where the field shows
 * the "can't be displayed" notice (SPOTD-1300); validation sees the field with no type, so any value it
 * holds passes and a `required` one still has to be there.
 *
 * Only schema keywords are walked, never data such as `default`, `const` or `enum`. Pure, memoized per
 * schema object, and the caller's own object comes back when every type is valid.
 */
export const sanitizeSchemaTypes = <S extends RJSFSchema | undefined>(schema: S): S => sanitizeNode(schema) as S;
