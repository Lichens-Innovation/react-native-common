import { type ComponentProps, type FunctionComponent, type ReactNode } from 'react';
import { useTranslation } from 'react-i18next';
import { StyleSheet } from 'react-native';
import { Button, Dialog, Portal } from 'react-native-paper';
import { useDialogStyles } from './use-dialog-styles';

type DialogProps = ComponentProps<typeof Dialog>;

export interface DialogCloseOnlyProps extends Omit<DialogProps, 'children' | 'visible'> {
  icon?: string;
  title?: ReactNode;
  content?: ReactNode;
  onClose: () => void;
  isVisible: boolean;
}

export const DialogCloseOnly: FunctionComponent<DialogCloseOnlyProps> = ({
  icon,
  title,
  content,
  onClose,
  isVisible,
  ...rest
}) => {
  const { style: dialogStyleProp, ...dialogProps } = rest;
  const styles = useStyles();
  const { t } = useTranslation();

  const hasIcon = !!icon;
  const hasTitle = !!title;
  const hasContent = !!content;

  if (!isVisible) {
    return null;
  }

  return (
    <Portal>
      <Dialog style={[styles.dialog, dialogStyleProp]} visible={true} onDismiss={onClose} {...dialogProps}>
        {hasIcon && <Dialog.Icon icon={icon} />}
        {hasTitle && <Dialog.Title>{title}</Dialog.Title>}
        {hasContent && <Dialog.Content>{content}</Dialog.Content>}

        <Dialog.Actions>
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

  return StyleSheet.create({
    dialog: {
      width,
      alignSelf,
    },
  });
};
