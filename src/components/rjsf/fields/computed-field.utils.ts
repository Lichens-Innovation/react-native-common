import { isBlank, isNotBlank } from '@lichens-innovation/ts-common';
import { DEFAULT_ID_PREFIX, DEFAULT_ID_SEPARATOR, type Registry, type RJSFSchema, type UiSchema } from '@rjsf/utils';
import Mexp from 'math-expression-evaluator';
import type { LiveEntry } from '../root-form-data-context';

export interface ComputedFieldOptions {
  formula: string;
  precision: number;
  unit?: string;
  showInfoButton: boolean;
}

type VarStatus = 'ok' | 'missing' | 'rejected';

export interface UsedVar {
  name: string;
  title: string | null;
  value: number | null;
  status: VarStatus;
}

export interface RegistrySources {
  rootSchema?: RJSFSchema;
  idPrefix: string;
  idSeparator: string;
}

interface FormulaSources {
  rootData?: Record<string, unknown>;
  rootSchema?: RJSFSchema;
  live: ReadonlyMap<string, LiveEntry>;
  idPrefix: string;
  idSeparator: string;
}

interface ResolvedFormula {
  expression: string;
  usedVars: UsedVar[];
}

interface ComputeFormulaArgs extends FormulaSources {
  formula: string;
  precision: number;
}

export interface ComputedFormula {
  computed: number | null;
  displayText: string;
  usedVars: UsedVar[];
}

const NUMERIC_SCHEMA_TYPES: ReadonlyArray<RJSFSchema['type']> = ['number', 'integer'];
const SLUG_PATTERN = /\{([a-zA-Z_$][a-zA-Z0-9_$]*)\}/g;
const EMPTY_DISPLAY_TEXT = '—';
const DEFAULT_PRECISION = 2;

const mexp = new Mexp();

export const parseComputedFieldOptions = (uiSchema?: UiSchema): ComputedFieldOptions => {
  const options = (uiSchema?.['ui:options'] ?? {}) as Partial<ComputedFieldOptions>;

  return {
    formula: typeof options.formula === 'string' ? options.formula : '',
    precision: typeof options.precision === 'number' ? options.precision : DEFAULT_PRECISION,
    unit: typeof options.unit === 'string' ? options.unit : undefined,
    showInfoButton: options.showInfoButton !== false,
  };
};

// Optional chaining: a field rendered outside a Form (unit test, hand-built registry) has no globalFormOptions. habit-hooks-disable non-essential-comment
export const getRegistrySources = (registry?: Registry): RegistrySources => ({
  rootSchema: registry?.rootSchema as RJSFSchema | undefined,
  idPrefix: registry?.globalFormOptions?.idPrefix ?? DEFAULT_ID_PREFIX,
  idSeparator: registry?.globalFormOptions?.idSeparator ?? DEFAULT_ID_SEPARATOR,
});

/** habit-hooks-disable non-essential-comment
 * Whether a value is a DynamicFetchField answer: an object wrapper — `{ data, fetched_at,
 * manually_edited, feature_uuid }` — because a fetched value has to carry the moment and the entity
 * it was read from. The number a formula wants is inside it. A fetch that found nothing leaves `data`
 * out, so `feature_uuid` alone also identifies one.
 */
const isFetchedAnswer = (value: unknown): value is { data?: unknown } =>
  value !== null && typeof value === 'object' && !Array.isArray(value) && ('data' in value || 'feature_uuid' in value);

/** habit-hooks-disable non-essential-comment
 * A live entry is the value the widget just parsed, one rjsf cycle ahead of rootData. Read it by
 * presence, not by `??`: a cleared field publishes an entry holding `undefined`, and falling back to
 * rootData there would keep showing a number for a field the user just emptied (SPOTD-621).
 */
const readSourceValue = (slug: string, { rootData, live, idPrefix, idSeparator }: FormulaSources): unknown => {
  const liveEntry = live.get([idPrefix, slug].join(idSeparator));

  return liveEntry ? liveEntry.value : rootData?.[slug];
};

/** habit-hooks-disable non-essential-comment
 * An object-typed property counts as a source when it is a fetched answer, or is not answered at all
 * yet — a field waiting on its fetch has a MISSING value, which is what the info dialog should say. An
 * object that is answered and is not a wrapper (a compliance row, a repeatable section) really is the
 * wrong kind of field, and is still reported as such.
 */
const isNumericSource = (propType: RJSFSchema['type'], rawValue: unknown): boolean => {
  if (NUMERIC_SCHEMA_TYPES.includes(propType)) return true;

  return propType === 'object' && (isFetchedAnswer(rawValue) || rawValue === undefined || rawValue === null);
};

const resolveVariable = (slug: string, sources: FormulaSources): UsedVar => {
  const properties = (sources.rootSchema?.properties ?? {}) as Record<string, RJSFSchema>;
  const propSchema = properties[slug];
  const title = typeof propSchema?.title === 'string' ? propSchema.title : null;
  const rawValue = readSourceValue(slug, sources);
  const raw = isFetchedAnswer(rawValue) ? rawValue.data : rawValue;

  if (!isNumericSource(propSchema?.type, rawValue)) return { name: slug, title, value: null, status: 'rejected' };
  if (typeof raw !== 'number' || !Number.isFinite(raw)) return { name: slug, title, value: null, status: 'missing' };

  return { name: slug, title, value: raw, status: 'ok' };
};

const resolveFormula = (formula: string, sources: FormulaSources): ResolvedFormula => {
  const usedVarsMap = new Map<string, UsedVar>();

  const expression = formula.replace(SLUG_PATTERN, (_match, slug: string) => {
    const variable = resolveVariable(slug, sources);
    if (!usedVarsMap.has(slug)) usedVarsMap.set(slug, variable);

    return variable.status === 'ok' ? `(${variable.value})` : '0';
  });

  return { expression, usedVars: Array.from(usedVarsMap.values()) };
};

const evaluateExpression = (expression: string, precision: number): number | null => {
  try {
    const value = mexp.eval(expression);

    return Number.isFinite(value) ? Number(value.toFixed(precision)) : null;
  } catch {
    return null;
  }
};

export const computeFormula = ({ formula, precision, ...sources }: ComputeFormulaArgs): ComputedFormula => {
  if (isBlank(formula)) return { computed: null, displayText: EMPTY_DISPLAY_TEXT, usedVars: [] };

  const { expression, usedVars } = resolveFormula(formula, sources);
  const allResolved = usedVars.every((usedVar) => usedVar.status === 'ok');
  const computed = allResolved ? evaluateExpression(expression, precision) : null;

  return { computed, displayText: computed === null ? EMPTY_DISPLAY_TEXT : String(computed), usedVars };
};

export const formatUsedVarName = ({ name, title }: UsedVar): string => (isNotBlank(title) ? `${name}: ${title}` : name);

export const formatUsedVarValue = ({ status, value }: UsedVar): string => {
  if (status === 'rejected') return 'not a number field';

  return value === null ? 'null' : String(value);
};
