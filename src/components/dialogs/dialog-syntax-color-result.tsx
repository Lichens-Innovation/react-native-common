import { type ComponentProps, type FunctionComponent, type ReactNode } from 'react';
import { useTranslation } from 'react-i18next';
import { ScrollView, StyleSheet, useWindowDimensions } from 'react-native';
import { Button, Dialog, Portal } from 'react-native-paper';
import { setClipboardTextContent } from '../../utils/clipboard.utils';
import { useSnackbar } from '../snack-bar/snackbar-provider';
import { SyntaxColoring } from '../syntax/syntax-coloring';
import { useDialogStyles } from './use-dialog-styles';

type DialogProps = ComponentProps<typeof Dialog>;

interface DialogSyntaxColorResultProps extends Omit<DialogProps, 'children' | 'visible'> {
  icon?: string;
  title: ReactNode;
  code: string;
  language: string;
  maxCodeLength?: number;
  onClose: () => void;
  isVisible: boolean;
}

export const DialogSyntaxColorResult: FunctionComponent<DialogSyntaxColorResultProps> = ({
  icon,
  title,
  code,
  language,
  maxCodeLength,
  onClose,
  isVisible,
  ...dialogProps
}) => {
  const styles = useStyles();
  const { showSnackbarMessage } = useSnackbar();
  const { t } = useTranslation();

  const hasIcon = !!icon;
  const hasTitle = !!title;

  const onCopy = () => {
    setClipboardTextContent(code);
    showSnackbarMessage(t('common:copiedToClipboard'));
  };

  if (!isVisible) {
    return null;
  }

  return (
    <Portal>
      <Dialog visible={true} onDismiss={onClose} style={styles.dialog} {...dialogProps}>
        {hasIcon && <Dialog.Icon icon={icon} />}
        {hasTitle && <Dialog.Title>{title}</Dialog.Title>}

        <Dialog.ScrollArea>
          <ScrollView>
            <SyntaxColoring code={code} language={language} maxCodeLength={maxCodeLength} />
          </ScrollView>
        </Dialog.ScrollArea>

        <Dialog.Actions>
          <Button mode="outlined" onPress={onCopy} icon="content-copy">
            {t('common:copy')}
          </Button>
          <Button mode="contained" onPress={onClose}>
            {t('common:close')}
          </Button>
        </Dialog.Actions>
      </Dialog>
    </Portal>
  );
};

const useStyles = () => {
  const { width, alignSelf } = useDialogStyles();
  const { height } = useWindowDimensions();

  return StyleSheet.create({
    dialog: {
      maxHeight: height * 0.8,
      width,
      alignSelf,
    },
  });
};
