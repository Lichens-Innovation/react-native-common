import type { RjsfRegistryWithTranslate } from '@lichens-innovation/ts-common/rjsf';
import { getSubmitButtonOptions, getUiOptions, TranslatableString } from '@rjsf/utils';
import type { FunctionComponent } from 'react';
import { useContext } from 'react';
import { StyleSheet, View } from 'react-native';
import { Button, IconButton } from 'react-native-paper';
import { useAppTheme } from '../../theme';
import { FormSubmitContext } from './form-submit-context';

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
  const { submitText, norender, props: buttonProps } = getSubmitButtonOptions(uiSchema);
  const styles = useStyles();

  if (norender) return null;

  const fakeEvent = {
    preventDefault: () => {},
    persist: () => {},
  };

  return (
    <View style={styles.submitRow}>
      <Button mode="contained" onPress={() => submit?.(fakeEvent)} {...buttonProps}>
        {submitText}
      </Button>
    </View>
  );
};

const useStyles = () => {
  const theme = useAppTheme();

  return StyleSheet.create({
    submitRow: {
      marginTop: theme.spacing(2),
      alignItems: 'center',
    },
  });
};
