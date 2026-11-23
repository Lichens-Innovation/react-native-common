import { type FunctionComponent, type ReactNode } from 'react';
import { useTranslation } from 'react-i18next';
import { Button } from 'react-native-paper';
import { DialogFrame, type DialogFrameProps } from './dialog-frame';

export interface DialogCloseOnlyProps extends Omit<DialogFrameProps, 'actions' | 'description' | 'children'> {
  content?: ReactNode;
  onClose: () => void;
}

export const DialogCloseOnly: FunctionComponent<DialogCloseOnlyProps> = ({ content, onClose, ...frameProps }) => {
  const { t } = useTranslation();

  return (
    <DialogFrame
      onDismiss={onClose}
      {...frameProps}
      description={content}
      actions={
        <Button mode="contained" onPress={onClose}>
          {t('common:close')}
        </Button>
      }
    />
  );
};
