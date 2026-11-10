import { isBlank } from '@lichens-innovation/ts-common';
import { useMemo, type FunctionComponent } from 'react';
import { StyleSheet, View } from 'react-native';
import { Text } from 'react-native-paper';
import { useAppTheme } from '../../../theme/theme.index';
import { DialogCloseOnly } from '../../dialogs/dialog-close-only';
import { formatUsedVarName, formatUsedVarValue, type UsedVar } from './computed-field.utils';

interface ComputedFieldInfoDialogProps {
  isVisible: boolean;
  onClose: () => void;
  displayLabel?: string;
  formula: string;
  usedVars: UsedVar[];
}

export const ComputedFieldInfoDialog: FunctionComponent<ComputedFieldInfoDialogProps> = ({
  isVisible,
  onClose,
  displayLabel,
  formula,
  usedVars,
}) => {
  const styles = useStyles();

  return (
    <DialogCloseOnly
      isVisible={isVisible}
      onClose={onClose}
      title={isBlank(displayLabel) ? 'Formula' : displayLabel}
      content={
        <View style={styles.dialogContent}>
          <Text variant="labelMedium">Formula</Text>
          <Text variant="bodyMedium" style={styles.mono}>
            {isBlank(formula) ? '(none)' : formula}
          </Text>
          {usedVars.length > 0 && (
            <>
              <Text variant="labelMedium" style={styles.varsHeader}>
                Variables
              </Text>
              {usedVars.map((usedVar) => (
                <Text
                  key={usedVar.name}
                  variant="bodyMedium"
                  style={[styles.mono, usedVar.status !== 'ok' ? styles.varBad : undefined]}
                >
                  {formatUsedVarName(usedVar)} = {formatUsedVarValue(usedVar)}
                </Text>
              ))}
            </>
          )}
        </View>
      }
    />
  );
};

const useStyles = () => {
  const theme = useAppTheme();

  return useMemo(
    () =>
      StyleSheet.create({
        dialogContent: {
          gap: theme.spacing(0.5),
        },
        mono: {
          fontFamily: 'monospace',
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
