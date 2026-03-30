import { useAppTheme } from '../../theme/theme';
import React, { FunctionComponent } from 'react';
import { Modal, ModalProps } from 'react-native';
import { PaperProvider } from 'react-native-paper';

/**
 * AppModal component that provides a Modal with proper theme context.
 * This ensures that all components inside the modal have access to the correct theme,
 * including the spacing function and other theme properties.
 *
 * It uses the same theme logic as app.tsx to ensure consistency across the application.
 */
export const AppModal: FunctionComponent<ModalProps> = ({ children, ...modalProps }) => {
  const theme = useAppTheme();

  return (
    <Modal {...modalProps}>
      <PaperProvider theme={theme}>{children}</PaperProvider>
    </Modal>
  );
};
