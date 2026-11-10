import { getRjsfDisplayLabel, getRjsfLabelColor, hasRjsfErrors } from '@lichens-innovation/ts-common/rjsf';
import type { WidgetProps } from '@rjsf/utils';
import { useMemo } from 'react';
import { StyleSheet } from 'react-native';
import { useAppTheme } from '../../../../theme/theme.index';
import { mergeLabelColorTheme } from '../../label-color-theme';

type OutlinedInputWidgetProps = Pick<
  WidgetProps,
  'label' | 'hideLabel' | 'required' | 'rawErrors' | 'options' | 'placeholder' | 'disabled'
>;

export const useOutlinedInputProps = ({
  label,
  hideLabel,
  required,
  rawErrors,
  options,
  placeholder,
  disabled,
}: OutlinedInputWidgetProps) => {
  const theme = useAppTheme();
  const styles = useStyles();

  return {
    mode: 'outlined' as const,
    label: getRjsfDisplayLabel({ label, required, hideLabel }),
    placeholder,
    disabled,
    error: hasRjsfErrors(rawErrors),
    style: styles.input,
    outlineColor: theme.colors.outline,
    theme: mergeLabelColorTheme(theme, getRjsfLabelColor(options)),
  };
};

const useStyles = () => {
  const theme = useAppTheme();
  return useMemo(
    () =>
      StyleSheet.create({
        input: {
          marginVertical: theme.spacing(0.5),
        },
      }),
    [theme]
  );
};
