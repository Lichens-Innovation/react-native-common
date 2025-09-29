import { type ComponentProps, type FunctionComponent, type ReactNode } from 'react';
import { useTranslation } from 'react-i18next';
import { StyleSheet } from 'react-native';
import { Button, Dialog, Portal, Text } from 'react-native-paper';
import { useDialogStyles } from './use-dialog-styles';

type DialogProps = ComponentProps<typeof Dialog>;

interface DialogOkCancelProps extends Omit<DialogProps, 'children' | 'visible'> {
  icon?: string;
  title?: ReactNode;
  description?: ReactNode;
  onOk: () => void;
  onCancel: () => void;
  isVisible: boolean;
}

export const DialogOkCancel: FunctionComponent<DialogOkCancelProps> = ({
  icon,
  title,
  description,
  onOk,
  onCancel,
  isVisible,
  ...rest
}) => {
  const { style: dialogStyleProp, ...dialogProps } = rest;
  const styles = useStyles();
  const { t } = useTranslation();

  const hasIcon = !!icon;

  const hasTitle = !!title;
  const hasTitleString = typeof title === 'string';

  const hasDescription = !!description;
  const hasDescriptionString = typeof description === 'string';

  if (!isVisible) {
    return null;
  }

  return (
    <Portal>
      <Dialog style={[styles.dialog, dialogStyleProp]} visible={true} onDismiss={onCancel} {...dialogProps}>
        {hasIcon && <Dialog.Icon icon={icon} />}

        {hasTitle && <Dialog.Title>{hasTitleString ? <Text>{title}</Text> : title}</Dialog.Title>}

        {hasDescription && (
          <Dialog.Content>{hasDescriptionString ? <Text>{description}</Text> : description}</Dialog.Content>
        )}

        <Dialog.Actions>
          <Button onPress={onCancel}>{t('common:cancel')}</Button>
          <Button style={styles.button} mode="contained" onPress={onOk}>
            {t('common:ok')}
          </Button>
        </Dialog.Actions>
      </Dialog>
    </Portal>
  );
};

const useStyles = () => {
  const { width, alignSelf } = useDialogStyles();

  return StyleSheet.create({
    button: {
      width: 60,
    },
    dialog: {
      width,
      alignSelf,
    },
  });
};
