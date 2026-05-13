import {
  getRjsfDisplayLabel,
  hasRjsfErrors,
  mapEnumOptions,
  toStringOrUndefined,
} from '@lichens-innovation/ts-common/rjsf';
import type { WidgetProps } from '@rjsf/utils';
import { useCallback, useMemo, type FunctionComponent } from 'react';
import { StyleSheet, View } from 'react-native';
import { DropDownSelector } from '../../../components/drop-down-selector/drop-down-selector';
import { useAppTheme } from '../../../theme';

export const SelectWidget: FunctionComponent<WidgetProps> = ({
  id,
  value,
  disabled,
  readonly,
  placeholder,
  onChange,
  onBlur,
  label,
  hideLabel,
  required,
  rawErrors,
  options,
}) => {
  const styles = useStyles();
  const hasError = hasRjsfErrors(rawErrors);
  const displayLabel = getRjsfDisplayLabel({ label, required, hideLabel });
  const selectOptions = useMemo(() => mapEnumOptions(options), [options]);
  const strValue = toStringOrUndefined(value);

  const handleChange = useCallback(
    (code: string) => {
      onChange(code);
      onBlur(id, code);
    },
    [onChange, onBlur, id]
  );

  return (
    <View style={styles.widgetBlock}>
      <DropDownSelector
        label={displayLabel}
        value={strValue}
        onChange={handleChange}
        options={selectOptions}
        placeholder={placeholder}
        disabled={disabled || readonly}
        isError={hasError}
      />
    </View>
  );
};

const useStyles = () => {
  const theme = useAppTheme();
  return useMemo(
    () =>
      StyleSheet.create({
        widgetBlock: {
          marginVertical: theme.spacing(0.5),
        },
      }),
    [theme]
  );
};
