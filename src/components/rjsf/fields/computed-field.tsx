import { getRjsfDisplayLabel, getRjsfLabelColor } from '@lichens-innovation/ts-common/rjsf';
import { DEFAULT_ID_PREFIX, DEFAULT_ID_SEPARATOR, type FieldProps, type RJSFSchema } from '@rjsf/utils';
import Mexp from 'math-expression-evaluator';
import { useEffect, useMemo, useRef, useState, type FunctionComponent } from 'react';
import { StyleSheet, View } from 'react-native';
import { IconButton, Text, TextInput } from 'react-native-paper';
import { useAppTheme } from '../../../theme';
import { mergeLabelColorTheme } from '../label-color-theme';
import { DialogCloseOnly } from '../../dialogs/dialog-close-only';
import { useRootFormSnapshot, type LiveEntry } from '../root-form-data-context';

type ComputedFieldOptions = {
  formula?: string;
  precision?: number;
  unit?: string;
  showInfoButton?: boolean;
  labelColor?: string;
};

const SLUG_PATTERN = /\{([a-zA-Z_$][a-zA-Z0-9_$]*)\}/g;

const mexp = new Mexp();

type VarStatus = 'ok' | 'missing' | 'rejected';
type UsedVar = { name: string; title: string | null; value: number | null; status: VarStatus };

type ResolveResult = {
  expression: string;
  missing: string[];
  rejected: string[];
  usedVars: UsedVar[];
};

type ResolveArgs = {
  formula: string;
  rootData: Record<string, unknown> | undefined;
  rootSchema: RJSFSchema | undefined;
  /** Values a widget has published ahead of rjsf's change cycle, keyed by rjsf field id. */
  live: ReadonlyMap<string, LiveEntry>;
  idPrefix: string;
  idSeparator: string;
};

/**
 * Whether a value is a DynamicFetchField answer: an object wrapper — `{ data, fetched_at,
 * manually_edited, feature_uuid }` — because a fetched value has to carry the moment and the entity
 * it was read from. The number a formula wants is inside it.
 */
const isFetchedAnswer = (value: unknown): value is { data: unknown } =>
  value !== null && typeof value === 'object' && !Array.isArray(value) && 'data' in value;

const resolveFormula = ({ formula, rootData, rootSchema, live, idPrefix, idSeparator }: ResolveArgs): ResolveResult => {
  const missing: string[] = [];
  const rejected: string[] = [];
  const usedVarsMap = new Map<string, UsedVar>();
  const properties = (rootSchema?.properties ?? {}) as Record<string, RJSFSchema>;

  const expression = formula.replace(SLUG_PATTERN, (_match, slug: string) => {
    const propSchema = properties[slug];
    const title = typeof propSchema?.title === 'string' ? propSchema.title : null;
    const propType = propSchema?.type;
    // A live entry is the value the widget just parsed, one rjsf cycle ahead of rootData. Read it by
    // presence, not by `??`: a cleared field publishes an entry holding `undefined`, and falling back
    // to rootData there would keep showing a number for a field the user just emptied (SPOTD-621).
    const liveEntry = live.get([idPrefix, slug].join(idSeparator));
    const rawValue = liveEntry ? liveEntry.value : rootData?.[slug];
    const raw = isFetchedAnswer(rawValue) ? rawValue.data : rawValue;
    const isNumericSchema = propType === 'number' || propType === 'integer';
    // An object-typed property counts as a source when it is a fetched answer, or is not answered at
    // all yet — a field waiting on its fetch has a MISSING value, which is what the info dialog
    // should say. An object that is answered and is not a wrapper (a compliance row, a repeatable
    // section) really is the wrong kind of field, and is still reported as such.
    const isFetchedSource =
      propType === 'object' && (isFetchedAnswer(rawValue) || rawValue === undefined || rawValue === null);
    if (!isNumericSchema && !isFetchedSource) {
      rejected.push(slug);
      if (!usedVarsMap.has(slug)) usedVarsMap.set(slug, { name: slug, title, value: null, status: 'rejected' });
      return '0';
    }
    if (typeof raw !== 'number' || !Number.isFinite(raw)) {
      missing.push(slug);
      if (!usedVarsMap.has(slug)) usedVarsMap.set(slug, { name: slug, title, value: null, status: 'missing' });
      return '0';
    }
    if (!usedVarsMap.has(slug)) usedVarsMap.set(slug, { name: slug, title, value: raw, status: 'ok' });
    return `(${raw})`;
  });

  return { expression, missing, rejected, usedVars: Array.from(usedVarsMap.values()) };
};

export const ComputedField: FunctionComponent<FieldProps<unknown, RJSFSchema>> = ({
  formData,
  onChange,
  schema,
  uiSchema,
  registry,
  required,
  fieldPathId,
  id,
}) => {
  const styles = useStyles();
  const theme = useAppTheme();
  const [infoVisible, setInfoVisible] = useState(false);

  const options = (uiSchema?.['ui:options'] ?? {}) as ComputedFieldOptions;
  const formula = typeof options.formula === 'string' ? options.formula : '';
  const precision = typeof options.precision === 'number' ? options.precision : 2;
  const unit = typeof options.unit === 'string' ? options.unit : undefined;
  const showInfoButton = options.showInfoButton !== false;

  const label = typeof schema.title === 'string' ? schema.title : '';
  const hideLabel = uiSchema?.['ui:options']?.label === false;
  const displayLabel = getRjsfDisplayLabel({ label, required, hideLabel });
  const labelColorTheme = mergeLabelColorTheme(theme, getRjsfLabelColor(options));

  const { data: rootData, live } = useRootFormSnapshot();
  const rootSchema = registry?.rootSchema as RJSFSchema | undefined;
  // Optional like the rootSchema read above: a field rendered outside a Form (a unit test with a
  // hand-built registry) must not crash on a missing globalFormOptions.
  const idPrefix = registry?.globalFormOptions?.idPrefix ?? DEFAULT_ID_PREFIX;
  const idSeparator = registry?.globalFormOptions?.idSeparator ?? DEFAULT_ID_SEPARATOR;

  const { computed, displayText, usedVars } = useMemo(() => {
    if (!formula) {
      return { computed: null as number | null, displayText: '—', usedVars: [] as UsedVar[] };
    }
    const resolved = resolveFormula({ formula, rootData, rootSchema, live, idPrefix, idSeparator });
    if (resolved.missing.length > 0 || resolved.rejected.length > 0) {
      return {
        computed: null as number | null,
        displayText: '—',
        usedVars: resolved.usedVars,
      };
    }
    try {
      const value = mexp.eval(resolved.expression);
      if (!Number.isFinite(value)) {
        return { computed: null as number | null, displayText: '—', usedVars: resolved.usedVars };
      }
      const rounded = Number(value.toFixed(precision));
      return { computed: rounded, displayText: String(rounded), usedVars: resolved.usedVars };
    } catch {
      return { computed: null as number | null, displayText: '—', usedVars: resolved.usedVars };
    }
  }, [formula, rootData, live, rootSchema, precision, idPrefix, idSeparator]);

  const baseId = fieldPathId?.$id ?? id ?? 'computedField';
  const fieldPath = fieldPathId?.path ?? [];

  // Writing back on mount marked a form dirty with no user action — the screen diffs rjsf's formData
  // against the baseline it captured at open — and cost a full rjsf change cycle while the form was
  // still appearing. A stored value that is already a finite number therefore stands until a
  // dependency actually changes; only a genuinely absent one is seeded (SPOTD-621).
  const hasSettledFirstPassRef = useRef(false);

  useEffect(() => {
    const isFirstPass = !hasSettledFirstPassRef.current;
    hasSettledFirstPassRef.current = true;
    const storedIsUsable = typeof formData === 'number' && Number.isFinite(formData);

    if (computed === null) {
      if (formData === undefined || isFirstPass) return;
      onChange(undefined as unknown, fieldPath, undefined, baseId);
      return;
    }
    if (computed === formData) return;
    if (isFirstPass && storedIsUsable) return;
    onChange(computed as unknown, fieldPath, undefined, baseId);
    // fieldPath/baseId derived from stable id; intentionally omitted from deps to avoid loops
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [computed]);

  return (
    <View style={styles.container}>
      <View style={styles.row}>
        <TextInput
          mode="outlined"
          label={displayLabel}
          value={displayText}
          editable={false}
          style={styles.input}
          outlineColor={theme.colors.outline}
          theme={labelColorTheme}
          right={unit ? <TextInput.Affix text={unit} /> : undefined}
        />
        {showInfoButton && formula ? (
          <IconButton
            icon="information-outline"
            size={20}
            onPress={() => setInfoVisible(true)}
            accessibilityLabel="Show formula"
          />
        ) : null}
      </View>

      <DialogCloseOnly
        isVisible={infoVisible}
        onClose={() => setInfoVisible(false)}
        title={displayLabel || 'Formula'}
        content={
          <View style={styles.dialogContent}>
            <Text variant="labelMedium">Formula</Text>
            <Text variant="bodyMedium" style={styles.mono}>
              {formula || '(none)'}
            </Text>
            {usedVars.length > 0 ? (
              <>
                <Text variant="labelMedium" style={styles.varsHeader}>
                  Variables
                </Text>
                {usedVars.map((v) => {
                  const isBad = v.status !== 'ok';
                  const valueText =
                    v.status === 'rejected' ? 'not a number field' : v.value === null ? 'null' : String(v.value);
                  const nameLabel = v.title ? `${v.name}: ${v.title}` : v.name;
                  return (
                    <Text key={v.name} variant="bodyMedium" style={[styles.mono, isBad ? styles.varBad : undefined]}>
                      {nameLabel} = {valueText}
                    </Text>
                  );
                })}
              </>
            ) : null}
          </View>
        }
      />
    </View>
  );
};

const useStyles = () => {
  const theme = useAppTheme();

  return useMemo(
    () =>
      StyleSheet.create({
        container: {
          marginVertical: theme.spacing(0.5),
        },
        row: {
          flexDirection: 'row',
          alignItems: 'center',
        },
        input: {
          flex: 1,
          marginVertical: theme.spacing(0.5),
        },
        dialogContent: {
          gap: theme.spacing(0.5),
        },
        mono: {
          fontFamily: 'monospace',
        },
        warning: {
          marginTop: theme.spacing(1),
          color: theme.colors.error,
        },
        varsHeader: {
          marginTop: theme.spacing(1),
        },
        varBad: {
          color: theme.colors.error,
        },
      }),
    [theme]
  );
};
