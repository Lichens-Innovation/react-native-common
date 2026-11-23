import { type FunctionComponent } from 'react';
import { useTranslation } from 'react-i18next';
import { ScrollView, StyleSheet, useWindowDimensions } from 'react-native';
import { Button, Dialog } from 'react-native-paper';
import { setClipboardTextContent } from '../../utils/device/clipboard.utils';
import { useSnackbar } from '../snack-bar/snackbar-provider';
import { SyntaxColoring } from '../syntax/syntax-coloring';
import { DialogFrame, type DialogFrameProps } from './dialog-frame';

interface DialogSyntaxColorResultProps extends Omit<DialogFrameProps, 'actions' | 'description' | 'children'> {
  title: DialogFrameProps['title'];
  code: string;
  language: string;
  maxCodeLength?: number;
  onClose: () => void;
}

export const DialogSyntaxColorResult: FunctionComponent<DialogSyntaxColorResultProps> = ({
  code,
  language,
  maxCodeLength,
  onClose,
  ...frameProps
}) => {
  const styles = useStyles();
  const { showSnackbarMessage } = useSnackbar();
  const { t } = useTranslation();

  const onCopy = () => {
    void setClipboardTextContent(code);
    showSnackbarMessage(t('common:copiedToClipboard'));
  };

  return (
    <DialogFrame
      onDismiss={onClose}
      style={styles.dialog}
      {...frameProps}
      actions={
        <>
          <Button mode="outlined" onPress={onCopy} icon="content-copy">
            {t('common:copy')}
          </Button>
          <Button mode="contained" onPress={onClose}>
            {t('common:close')}
          </Button>
        </>
      }
    >
      <Dialog.ScrollArea>
        <ScrollView>
          <SyntaxColoring code={code} language={language} maxCodeLength={maxCodeLength} />
        </ScrollView>
      </Dialog.ScrollArea>
    </DialogFrame>
  );
};

const useStyles = () => {
  const { height } = useWindowDimensions();

  return StyleSheet.create({
    dialog: {
      maxHeight: height * 0.8,
    },
  });
};
