import { isNotBlank } from '@lichens-innovation/ts-common';
import { type FunctionComponent, useState } from 'react';
import { StyleSheet } from 'react-native';
import { Dialog, Text, TextInput } from 'react-native-paper';
import { useAppTheme } from '../../theme/theme';
import { DialogFrame, type DialogFrameProps } from './dialog-frame';
import { DialogOkCancelActions } from './dialog-ok-cancel-actions';

interface TextInputSelection {
  start: number;
  end: number;
}

interface DialogSingleTextInputProps extends Omit<DialogFrameProps, 'actions' | 'children' | 'icon'> {
  title: DialogFrameProps['title'];
  value: string;
  onChange: (value: string) => void;
  errorMessage?: string;
  placeholder?: string;
  onOk: (inputValue: string) => void;
  onCancel: () => void;
}

export const DialogSingleTextInput: FunctionComponent<DialogSingleTextInputProps> = ({
  value,
  onChange,
  errorMessage,
  placeholder,
  onOk,
  onCancel,
  ...frameProps
}) => {
  const styles = useStyles();

  const [selection, setSelection] = useState<TextInputSelection>();
  const [inputValue, setInputValue] = useState(value);

  const hasError = isNotBlank(errorMessage);
  const isInputPopulated = inputValue.trim().length > 0;
  const isOkEnabled = !hasError && isInputPopulated;

  const onChangeText = (text: string) => {
    setInputValue(text);
    onChange(text);
  };

  return (
    <DialogFrame
      {...frameProps}
      onDismiss={onCancel}
      actions={<DialogOkCancelActions isOkDisabled={!isOkEnabled} onOk={() => onOk(inputValue)} onCancel={onCancel} />}
    >
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

        {hasError && (
          <Text variant="bodyMedium" style={styles.errorText}>
            {errorMessage}
          </Text>
        )}
      </Dialog.Content>
    </DialogFrame>
  );
};

const useStyles = () => {
  const theme = useAppTheme();

  return StyleSheet.create({
    errorText: {
      marginTop: theme.spacing(1),
      color: theme.colors.error,
    },
  });
};
