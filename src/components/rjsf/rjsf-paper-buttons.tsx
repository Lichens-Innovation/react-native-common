import type { RjsfRegistryWithTranslate } from '@lichens-innovation/ts-common/rjsf';
import { getSubmitButtonOptions, getUiOptions, TranslatableString } from '@rjsf/utils';
import type { FunctionComponent } from 'react';
import { useContext, useMemo } from 'react';
import { StyleSheet, View } from 'react-native';
import { IconButton, Button, FAB, Portal } from 'react-native-paper';
import { useAppTheme } from '../../theme';
import { FormSubmitContext, SubmitButtonOptionsContext } from './form-submit-context';
import { SafeAreaView } from 'react-native-safe-area-context';

export interface IconButtonProps {
  id?: string;
  onClick?: () => void;
  disabled?: boolean;
  readonly?: boolean;
  registry: RjsfRegistryWithTranslate;
  uiSchema?: Record<string, unknown>;
  title?: string;
}

export const AddButton: FunctionComponent<IconButtonProps> = ({ registry, onClick, disabled, title }) => {
  const label = registry.translateString(TranslatableString.AddItemButton);
  return <IconButton icon="plus" onPress={onClick} disabled={disabled} accessibilityLabel={title ?? label} />;
};

export const CopyButton: FunctionComponent<IconButtonProps> = ({ registry, onClick, disabled, title }) => {
  const label = registry.translateString(TranslatableString.CopyButton);
  return <IconButton icon="content-copy" onPress={onClick} disabled={disabled} accessibilityLabel={title ?? label} />;
};

export const MoveDownButton: FunctionComponent<IconButtonProps> = ({ registry, onClick, disabled, title }) => {
  const label = registry.translateString(TranslatableString.MoveDownButton);
  return <IconButton icon="arrow-down" onPress={onClick} disabled={disabled} accessibilityLabel={title ?? label} />;
};

export const MoveUpButton: FunctionComponent<IconButtonProps> = ({ registry, onClick, disabled, title }) => {
  const label = registry.translateString(TranslatableString.MoveUpButton);
  return <IconButton icon="arrow-up" onPress={onClick} disabled={disabled} accessibilityLabel={title ?? label} />;
};

export const RemoveButton: FunctionComponent<IconButtonProps> = ({ uiSchema, registry, onClick, disabled, title }) => {
  const options = getUiOptions(uiSchema);
  const label = registry.translateString(TranslatableString.RemoveButton);
  return (
    <IconButton
      icon="delete"
      onPress={onClick}
      disabled={disabled}
      iconColor={options?.block ? undefined : undefined}
      accessibilityLabel={title ?? label}
    />
  );
};

export const ClearButton: FunctionComponent<IconButtonProps> = ({ registry, onClick, disabled, title }) => {
  const label = registry.translateString(TranslatableString.ClearButton);
  return <IconButton icon="close" onPress={onClick} disabled={disabled} accessibilityLabel={title ?? label} />;
};

export interface SubmitButtonProps {
  uiSchema?: Record<string, unknown>;
  registry?: RjsfRegistryWithTranslate;
}

/**
 * RJSF form submit button.
 * Uses FormSubmitContext to get the submit handler (RJSF does not pass onSubmit to the theme button).
 * The fake event provides preventDefault() and persist() as no-ops to satisfy the web form submit
 * event contract, so an onSubmit that calls event.preventDefault() or event.persist() does not
 * crash on React Native, where onPress does not provide a form event.
 */
export const SubmitButton: FunctionComponent<SubmitButtonProps> = ({ uiSchema }) => {
  const submit = useContext(FormSubmitContext);
  const { submitButtonAbsolutePosition, submitButtonOverrideLabel } = useContext(SubmitButtonOptionsContext);
  const { submitText, norender, props: buttonProps } = getSubmitButtonOptions(uiSchema);
  const label = submitButtonOverrideLabel ?? submitText;
  const styles = useStyles();

  if (norender) return null;

  const fakeEvent = {
    preventDefault: () => {},
    persist: () => {},
  };

  return submitButtonAbsolutePosition ? (
    <Portal>
      <SafeAreaView style={styles.submitRowAbsolute}>
        <FAB
          style={styles.fab}
          color={styles.fab.color}
          variant="primary"
          onPress={() => submit?.(fakeEvent)}
          label={label ?? 'Submit'}
          {...buttonProps}
        />
      </SafeAreaView>
    </Portal>
  ) : (
    <View style={styles.submitRow}>
      <Button mode="contained" onPress={() => submit?.(fakeEvent)} {...buttonProps}>
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
