import type { RjsfRegistryWithTranslate } from '@lichens-innovation/ts-common/rjsf';
import { getSubmitButtonOptions } from '@rjsf/utils';
import { useContext, useMemo, type FunctionComponent } from 'react';
import { StyleSheet, View } from 'react-native';
import { Button, FAB, Portal } from 'react-native-paper';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useAppTheme } from '../../../theme/theme.index';
import { FormSubmitContext, SubmitButtonOptionsContext } from '../form-submit-context';
import { useScreenFocused } from './use-screen-focused';

export interface SubmitButtonProps {
  uiSchema?: Record<string, unknown>;
  registry?: RjsfRegistryWithTranslate;
}

// RN onPress carries no form event: callers' onSubmit may still call preventDefault()/persist(). habit-hooks-disable non-essential-comment
const FAKE_SUBMIT_EVENT = {
  preventDefault: () => {},
  persist: () => {},
};

export const SubmitButton: FunctionComponent<SubmitButtonProps> = ({ uiSchema }) => {
  const submit = useContext(FormSubmitContext);
  const { submitButtonAbsolutePosition, submitButtonOverrideLabel } = useContext(SubmitButtonOptionsContext);
  const { submitText, norender, props: buttonProps } = getSubmitButtonOptions(uiSchema);
  const label = submitButtonOverrideLabel ?? submitText;
  const styles = useStyles();
  const focused = useScreenFocused();

  if (norender) return null;

  if (submitButtonAbsolutePosition) {
    if (!focused) return null;
    return (
      <Portal>
        {/* box-none: the absolute container (padded by safe-area insets) must
            not intercept touches in its transparent area — otherwise it covers
            the bottom-right of the form and swallows taps meant for fields
            underneath (e.g. the location "pick on map" button). Only the FAB
            itself should be tappable. */}
        <SafeAreaView style={styles.submitRowAbsolute} pointerEvents="box-none">
          <FAB
            style={styles.fab}
            color={styles.fab.color}
            variant="primary"
            onPress={() => submit?.(FAKE_SUBMIT_EVENT)}
            label={label ?? 'Submit'}
            {...buttonProps}
          />
        </SafeAreaView>
      </Portal>
    );
  }

  return (
    <View style={styles.submitRow}>
      <Button mode="contained" onPress={() => submit?.(FAKE_SUBMIT_EVENT)} {...buttonProps}>
        {label}
      </Button>
    </View>
  );
};

const useStyles = () => {
  const theme = useAppTheme();

  return useMemo(
    () =>
      StyleSheet.create({
        submitRow: {
          marginTop: theme.spacing(2),
          alignItems: 'center',
        },
        submitRowAbsolute: {
          position: 'absolute',
          bottom: theme.spacing(2),
          right: theme.spacing(2),
        },
        fab: {
          backgroundColor: theme.colors.primary,
          color: theme.colors.onPrimary,
          height: 48,
          borderRadius: 24,
          justifyContent: 'center',
        },
      }),
    [theme]
  );
};
