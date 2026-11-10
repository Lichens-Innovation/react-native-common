import { isBlank } from '@lichens-innovation/ts-common';
import type { WidgetProps } from '@rjsf/utils';
import { useMemo, type FunctionComponent } from 'react';
import { Text, Divider } from 'react-native-paper';
import { StyleSheet, View } from 'react-native';
import { getRjsfDisplayLabel, getRjsfLabelColor } from '@lichens-innovation/ts-common/rjsf';
import { useAppTheme } from '../../../theme/theme.index';

interface LabelWidgetOptions {
  isSection?: boolean; // If true, render as a section header with larger font and divider underneath
}
export const LabelWidget: FunctionComponent<WidgetProps> = ({ label, required, hideLabel, options }) => {
  const styles = useStyles();
  const displayLabel = getRjsfDisplayLabel({ label, required, hideLabel });
  if (isBlank(displayLabel)) return null;
  const optionsTyped = options as LabelWidgetOptions;
  const isSection = optionsTyped && typeof optionsTyped.isSection === 'boolean' ? optionsTyped.isSection : false;
  const labelColor = getRjsfLabelColor(options);
  return (
    <View style={styles.container}>
      <Text
        variant={isSection ? 'headlineSmall' : 'bodyMedium'}
        style={[isSection ? styles.sectionLabel : null, labelColor ? { color: labelColor } : null]}
      >
        {displayLabel}
      </Text>
      {isSection && <Divider style={styles.divider} />}
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
        sectionLabel: {
          marginBottom: theme.spacing(0.5),
          marginTop: theme.spacing(2),
        },
        divider: {
          marginBottom: theme.spacing(0.5),
        },
      }),
    [theme]
  );
};
