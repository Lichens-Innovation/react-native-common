import { type FunctionComponent } from 'react';
import { useTranslation } from 'react-i18next';
import { StyleSheet } from 'react-native';
import { Button } from 'react-native-paper';

interface DialogOkCancelActionsProps {
  okLabel?: string;
  isOkDisabled?: boolean;
  onOk: () => void;
  onCancel: () => void;
}

export const DialogOkCancelActions: FunctionComponent<DialogOkCancelActionsProps> = ({
  okLabel,
  isOkDisabled = false,
  onOk,
  onCancel,
}) => {
  const { t } = useTranslation();

  return (
    <>
      <Button onPress={onCancel}>{t('common:cancel')}</Button>
      <Button style={okLabel ? undefined : styles.okButton} mode="contained" onPress={onOk} disabled={isOkDisabled}>
        {okLabel ?? t('common:ok')}
      </Button>
    </>
  );
};

const styles = StyleSheet.create({
  okButton: {
    width: 60,
  },
});
