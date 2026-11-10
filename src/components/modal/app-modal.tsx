import { useAppTheme } from '../../theme/theme';
import React, { FunctionComponent } from 'react';
import { Modal, ModalProps } from 'react-native';
import { PaperProvider } from 'react-native-paper';

/** habit-hooks-disable non-essential-comment
 * Re-provides the app theme inside the Modal so its children get the full theme (incl. `spacing`).
 */
export const AppModal: FunctionComponent<ModalProps> = ({ children, ...modalProps }) => {
  const theme = useAppTheme();

  return (
    <Modal {...modalProps}>
      <PaperProvider theme={theme}>{children}</PaperProvider>
    </Modal>
  );
};
