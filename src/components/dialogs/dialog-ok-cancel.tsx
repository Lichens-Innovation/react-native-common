import { type FunctionComponent } from 'react';
import { DialogFrame, type DialogFrameProps } from './dialog-frame';
import { DialogOkCancelActions } from './dialog-ok-cancel-actions';

interface DialogOkCancelProps extends Omit<DialogFrameProps, 'actions' | 'children'> {
  okLabel?: string;
  onOk: () => void;
  onCancel: () => void;
}

export const DialogOkCancel: FunctionComponent<DialogOkCancelProps> = ({ okLabel, onOk, onCancel, ...frameProps }) => (
  <DialogFrame
    onDismiss={onCancel}
    {...frameProps}
    actions={<DialogOkCancelActions okLabel={okLabel} onOk={onOk} onCancel={onCancel} />}
  />
);
