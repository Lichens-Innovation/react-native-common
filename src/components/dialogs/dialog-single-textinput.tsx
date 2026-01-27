import { type ComponentProps, type FunctionComponent, type ReactNode, useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { StyleSheet } from 'react-native';
import { Button, Dialog, Portal, Text, TextInput } from 'react-native-paper';
import { useAppTheme } from '../../theme/theme';
import { useDialogStyles } from './use-dialog-styles';

type DialogProps = ComponentProps<typeof Dialog>;

type TextInputSelection = { start: number; end: number };

interface DialogSingleTextInputProps extends Omit<DialogProps, 'children' | 'visible'> {
  title: ReactNode;
  description?: ReactNode;
  value: string;
  onChange: (value: string) => void;
  errorMessage?: string;
  placeholder?: string;
  onOk: (inputValue: string) => void;
  onCancel: () => void;
  isVisible: boolean;
}

export const DialogSingleTextInput: FunctionComponent<DialogSingleTextInputProps> = ({
  title,
  description,
  value,
  onChange,
  errorMessage,
  placeholder,
  onOk,
  onCancel,
  isVisible,
  ...rest
}) => {
  const { style: dialogStyleProp, ...dialogProps } = rest;
  const styles = useStyles();
  const { t } = useTranslation();

  const [selection, setSelection] = useState<TextInputSelection>();
  const [inputValue, setInputValue] = useState(value);

  const hasTitle = !!title;
  const hasTitleString = typeof title === 'string';

  const hasDescription = !!description;
  const hasDescriptionString = typeof description === 'string';

  const hasError = !!errorMessage;
  const isInputPopulated = inputValue.trim().length > 0;
  const isOkEnabled = !hasError && isInputPopulated;

  const onChangeText = (text: string) => {
    setInputValue(text);
    onChange(text);
  };

  if (!isVisible) {
    return null;
  }

  return (
    <Portal>
      <Dialog {...dialogProps} style={[styles.dialog, dialogStyleProp]} visible={true} onDismiss={onCancel}>
        {hasTitle && <Dialog.Title>{hasTitleString ? <Text>{title}</Text> : title}</Dialog.Title>}

        {hasDescription && (
          <Dialog.Content>{hasDescriptionString ? <Text>{description}</Text> : description}</Dialog.Content>
        )}

        <Dialog.Content>
          <TextInput
            mode="outlined"
            value={inputValue}
            onChangeText={onChangeText}
            selection={selection}
            onSelectionChange={(e) => setSelection(e.nativeEvent.selection)}
            placeholder={placeholder}
            error={hasError}
          />

          {hasError && <Text variant="bodyMedium" style={styles.errorText}>{errorMessage}</Text>}
        </Dialog.Content>

        <Dialog.Actions>
          <Button onPress={onCancel}>{t('common:cancel')}</Button>
          <Button style={styles.button} mode="contained" onPress={() => onOk(inputValue)} disabled={!isOkEnabled}>
            {t('common:ok')}
          </Button>
        </Dialog.Actions>
      </Dialog>
    </Portal>
  );
};

const useStyles = () => {
  const theme = useAppTheme();
  const { width, alignSelf } = useDialogStyles();

  return StyleSheet.create({
    button: {
      width: 60,
    },
    dialog: {
      width,
      alignSelf,
    },
    errorText: {
      marginTop: theme.spacing(1),
      color: theme.colors.error,
    },
  });
};
