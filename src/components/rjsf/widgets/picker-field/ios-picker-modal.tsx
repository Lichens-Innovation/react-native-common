import DateTimePicker, { type DateTimePickerEvent, type IOSNativeProps } from '@react-native-community/datetimepicker';
import type { FunctionComponent } from 'react';
import { useTranslation } from 'react-i18next';
import { Modal, Pressable, StyleSheet, Text, View } from 'react-native';
import { useAppTheme } from '../../../../theme/theme.index';
import { usePickerThemeVariant } from './use-picker-theme-variant';

interface IosPickerModalProps {
  visible: boolean;
  value: Date;
  mode: IOSNativeProps['mode'];
  onChange: (event: DateTimePickerEvent, selected?: Date) => void;
  onClose: () => void;
}

export const IosPickerModal: FunctionComponent<IosPickerModalProps> = ({ visible, value, mode, onChange, onClose }) => {
  const theme = useAppTheme();
  const styles = useStyles();
  const { t } = useTranslation();
  const themeVariant = usePickerThemeVariant();

  return (
    <Modal visible={visible} transparent animationType="slide">
      <Pressable style={styles.backdrop} onPress={onClose} />
      <View style={styles.container}>
        <View style={styles.header}>
          <Pressable onPress={onClose} style={styles.doneButton}>
            <Text style={styles.doneText}>{t('app:general.done')}</Text>
          </Pressable>
        </View>
        <DateTimePicker
          value={value}
          mode={mode}
          display="spinner"
          onChange={onChange}
          themeVariant={themeVariant}
          textColor={theme.colors.onSurface}
        />
      </View>
    </Modal>
  );
};

const useStyles = () => {
  const theme = useAppTheme();
  return StyleSheet.create({
    backdrop: {
      flex: 1,
    },
    container: {
      backgroundColor: theme.colors.surface,
      borderTopLeftRadius: theme.spacing(1.5),
      borderTopRightRadius: theme.spacing(1.5),
    },
    header: {
      flexDirection: 'row',
      justifyContent: 'flex-end',
      padding: theme.spacing(1.5),
      borderBottomWidth: StyleSheet.hairlineWidth,
      borderBottomColor: theme.colors.outline,
    },
    doneButton: {
      paddingHorizontal: theme.spacing(1),
      paddingVertical: theme.spacing(0.5),
    },
    doneText: {
      fontSize: 16,
      fontWeight: '600',
      color: theme.colors.primary,
    },
  });
};
