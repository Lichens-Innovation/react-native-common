import { getRjsfDisplayLabel, getRjsfLabelColor } from '@lichens-innovation/ts-common/rjsf';
import type { FieldProps, RJSFSchema } from '@rjsf/utils';
import Mexp from 'math-expression-evaluator';
import { useEffect, useMemo, useState, type FunctionComponent } from 'react';
import { StyleSheet, View } from 'react-native';
import { IconButton, Text, TextInput } from 'react-native-paper';
import { useAppTheme } from '../../../theme';
import { mergeLabelColorTheme } from '../label-color-theme';
import { DialogCloseOnly } from '../../dialogs/dialog-close-only';
import { useRootFormData } from '../root-form-data-context';

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

const resolveFormula = (
  formula: string,
  rootData: Record<string, unknown> | undefined,
  rootSchema: RJSFSchema | undefined
): ResolveResult => {
  const missing: string[] = [];
  const rejected: string[] = [];
  const usedVarsMap = new Map<string, UsedVar>();
  const properties = (rootSchema?.properties ?? {}) as Record<string, RJSFSchema>;

  const expression = formula.replace(SLUG_PATTERN, (_match, slug: string) => {
    const propSchema = properties[slug];
    const title = typeof propSchema?.title === 'string' ? propSchema.title : null;
    const propType = propSchema?.type;
    const isNumericSchema = propType === 'number' || propType === 'integer';
    if (!isNumericSchema) {
      rejected.push(slug);
      if (!usedVarsMap.has(slug)) usedVarsMap.set(slug, { name: slug, title, value: null, status: 'rejected' });
      return '0';
    }
    const raw = rootData?.[slug];
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
  formContext,
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

  const contextRootData = useRootFormData();
  const rootData =
    contextRootData ??
    (formContext as { rootFormData?: Record<string, unknown> } | undefined)?.rootFormData ??
    undefined;
  const rootSchema = registry?.rootSchema as RJSFSchema | undefined;

  const { computed, displayText, usedVars } = useMemo(() => {
    if (!formula) {
      return { computed: null as number | null, displayText: '—', usedVars: [] as UsedVar[] };
    }
    const resolved = resolveFormula(formula, rootData, rootSchema);
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
  }, [formula, rootData, rootSchema, precision]);

  const baseId = fieldPathId?.$id ?? id ?? 'computedField';
  const fieldPath = fieldPathId?.path ?? [];

  useEffect(() => {
    if (computed === null) {
      if (formData === undefined) return;
      onChange(undefined as unknown, fieldPath, undefined, baseId);
      return;
    }
    if (computed === formData) return;
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
