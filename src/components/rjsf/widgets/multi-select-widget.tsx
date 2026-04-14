import { getRjsfDisplayLabel, hasRjsfErrors, mapEnumOptions } from '@lichens-innovation/ts-common/rjsf';
import type { WidgetProps } from '@rjsf/utils';
import type { FunctionComponent } from 'react';
import { StyleSheet, View } from 'react-native';
import { DropDownMultiSelector } from '../../../components/drop-down-selector/drop-down-multi-selector';
import { useAppTheme } from '../../../theme';

export const MultiSelectWidget: FunctionComponent<WidgetProps> = ({
  id,
  value,
  disabled,
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
  const selectOptions = mapEnumOptions(options);

  // Ensure value is always an array of strings (or empty array)
  const arrValue = Array.isArray(value) ? value.map(String) : [];

  // Prefer options.placeholder, then options["ui:placeholder"], then schema placeholder, then fallback
  const effectivePlaceholder = (options && (options.placeholder || options['ui:placeholder'])) || placeholder || '...';

  const handleChange = (codes: string[]) => {
    onChange(codes);
    onBlur(id, codes);
  };

  return (
    <View style={styles.widgetBlock}>
      <DropDownMultiSelector
        label={displayLabel}
        value={arrValue}
        onChange={handleChange}
        options={selectOptions}
        placeholder={effectivePlaceholder}
        disabled={disabled}
        isError={hasError}
      />
    </View>
  );
};

const useStyles = () => {
  const theme = useAppTheme();
  return StyleSheet.create({
    widgetBlock: {
      marginVertical: theme.spacing(0.5),
    },
  });
};
