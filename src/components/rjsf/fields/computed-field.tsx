import { isNotBlank } from '@lichens-innovation/ts-common';
import { getRjsfLabelColor } from '@lichens-innovation/ts-common/rjsf';
import type { FieldProps, RJSFSchema } from '@rjsf/utils';
import { useMemo, useState, type FunctionComponent } from 'react';
import { StyleSheet, View } from 'react-native';
import { IconButton, TextInput } from 'react-native-paper';
import { useAppTheme } from '../../../theme/theme.index';
import { mergeLabelColorTheme } from '../label-color-theme';
import { useRootFormSnapshot } from '../root-form-data-context';
import { ComputedFieldInfoDialog } from './computed-field-info-dialog';
import { computeFormula, getRegistrySources, parseComputedFieldOptions } from './computed-field.utils';
import { getFieldDisplayLabel } from './field-display-label.utils';
import { useComputedValueWriteBack } from './use-computed-value-write-back';

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
  const [infoVisible, setInfoVisible] = useState<boolean>(false);

  const { formula, unit, showInfoButton } = parseComputedFieldOptions(uiSchema);
  const displayLabel = getFieldDisplayLabel({ schema, uiSchema, required });
  const labelColorTheme = mergeLabelColorTheme(theme, getRjsfLabelColor(uiSchema?.['ui:options']));
  const { data: rootData, live } = useRootFormSnapshot();

  const { computed, displayText, usedVars } = useMemo(
    () =>
      computeFormula({
        ...parseComputedFieldOptions(uiSchema),
        ...getRegistrySources(registry),
        rootData,
        live,
      }),
    [uiSchema, registry, rootData, live]
  );

  useComputedValueWriteBack({
    computed,
    formData,
    onChange,
    fieldPath: fieldPathId?.path ?? [],
    baseId: fieldPathId?.$id ?? id ?? 'computedField',
  });

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
          right={isNotBlank(unit) ? <TextInput.Affix text={unit} /> : undefined}
        />
        {showInfoButton && isNotBlank(formula) && (
          <IconButton
            icon="information-outline"
            size={20}
            onPress={() => setInfoVisible(true)}
            accessibilityLabel="Show formula"
          />
        )}
      </View>

      <ComputedFieldInfoDialog
        isVisible={infoVisible}
        onClose={() => setInfoVisible(false)}
        displayLabel={displayLabel}
        formula={formula}
        usedVars={usedVars}
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
      }),
    [theme]
  );
};
