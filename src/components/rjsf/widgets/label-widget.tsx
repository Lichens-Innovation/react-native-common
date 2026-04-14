import type { WidgetProps } from '@rjsf/utils';
import type { FunctionComponent } from 'react';
import { Text, Divider } from 'react-native-paper';
import { StyleSheet, View } from 'react-native';
import { getRjsfDisplayLabel } from '@lichens-innovation/ts-common/rjsf';
import { useAppTheme } from '../../../theme';

type LabelWidgetOptions = {
  isSection?: boolean; // If true, render as a section header with larger font and divider underneath
};
/**
 * LabelWidget: displays the field label/title as a readonly label, never fills form data.
 */
export const LabelWidget: FunctionComponent<WidgetProps> = ({ label, required, hideLabel, options }) => {
  const styles = useStyles();
  const displayLabel = getRjsfDisplayLabel({ label, required, hideLabel });
  if (!displayLabel) return null;
  const optionsTyped = options as LabelWidgetOptions;
  const isSection = optionsTyped && typeof optionsTyped.isSection === 'boolean' ? optionsTyped.isSection : false;
  return (
    <View style={styles.container}>
      <Text variant={isSection ? 'headlineSmall' : 'bodyMedium'} style={isSection ? styles.sectionLabel : undefined}>
        {displayLabel}
      </Text>
      {isSection ? <Divider style={styles.divider} /> : null}
    </View>
  );
};

const useStyles = () => {
  const theme = useAppTheme();
  return StyleSheet.create({
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
  });
};
