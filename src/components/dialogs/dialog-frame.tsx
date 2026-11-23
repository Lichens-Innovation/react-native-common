import { isNotBlank } from '@lichens-innovation/ts-common';
import { type ComponentProps, type FunctionComponent, type PropsWithChildren, type ReactNode } from 'react';
import { StyleSheet } from 'react-native';
import { Dialog, Portal, Text } from 'react-native-paper';
import { useDialogStyles } from './use-dialog-styles';

type DialogProps = ComponentProps<typeof Dialog>;

export interface DialogFrameProps extends PropsWithChildren<Omit<DialogProps, 'children' | 'visible'>> {
  isVisible: boolean;
  icon?: string;
  title?: ReactNode;
  description?: ReactNode;
  actions: ReactNode;
}

/** habit-hooks-disable non-essential-comment
 * The shell every dialog shares: mounted in a portal only while visible, sized for the screen, with an
 * optional icon, title and description above the dialog's own body and actions.
 */
export const DialogFrame: FunctionComponent<DialogFrameProps> = ({
  isVisible,
  icon,
  title,
  description,
  actions,
  children,
  style,
  ...dialogProps
}) => {
  const styles = useStyles();

  if (!isVisible) {
    return null;
  }

  const hasDescription = !!description;
  const isDescriptionString = typeof description === 'string';

  return (
    <Portal>
      <Dialog style={[styles.dialog, style]} visible={true} {...dialogProps}>
        {isNotBlank(icon) && <Dialog.Icon icon={icon} />}
        {!!title && <Dialog.Title>{title}</Dialog.Title>}

        {hasDescription && (
          <Dialog.Content>{isDescriptionString ? <Text>{description}</Text> : description}</Dialog.Content>
        )}

        {children}

        <Dialog.Actions>{actions}</Dialog.Actions>
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
