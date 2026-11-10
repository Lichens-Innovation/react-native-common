import { getRjsfDisplayLabel, getRjsfLabelColor, hasRjsfErrors } from '@lichens-innovation/ts-common/rjsf';
import type { WidgetProps } from '@rjsf/utils';
import { useMemo } from 'react';
import { StyleSheet } from 'react-native';
import { useAppTheme } from '../../../../theme/theme.index';
import { useCommitWidgetValue } from './use-commit-widget-value';
import { isWidgetDisplayOnly } from './widget-state.utils';

export const useDropDownWidgetProps = (widgetProps: WidgetProps) => {
  const { label, required, hideLabel, rawErrors, options } = widgetProps;
  const styles = useStyles();
  const commitValue = useCommitWidgetValue(widgetProps);

  return {
    blockStyle: styles.widgetBlock,
    dropDownProps: {
      label: getRjsfDisplayLabel({ label, required, hideLabel }),
      onChange: commitValue,
      disabled: isWidgetDisplayOnly(widgetProps),
      isError: hasRjsfErrors(rawErrors),
      labelColor: getRjsfLabelColor(options),
    },
  };
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
