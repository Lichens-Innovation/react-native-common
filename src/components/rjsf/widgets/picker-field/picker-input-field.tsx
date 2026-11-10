import type { WidgetProps } from '@rjsf/utils';
import type { FunctionComponent, PropsWithChildren } from 'react';
import { Pressable, StyleSheet, View } from 'react-native';
import { IconButton, TextInput } from 'react-native-paper';
import { useAppTheme } from '../../../../theme/theme.index';
import { useCommitWidgetValue } from '../shared/use-commit-widget-value';
import { useOutlinedInputProps } from '../shared/use-outlined-input-props';
import { isWidgetDisplayOnly } from '../shared/widget-state.utils';

interface PickerInputFieldProps extends PropsWithChildren<WidgetProps> {
  displayValue: string;
  icon: string;
  hasValue: boolean;
  onOpen: () => void;
}

export const PickerInputField: FunctionComponent<PickerInputFieldProps> = ({
  displayValue,
  icon,
  hasValue,
  onOpen,
  children,
  ...widgetProps
}) => {
  const { id, value, onFocus } = widgetProps;
  const styles = useStyles();
  const outlinedInputProps = useOutlinedInputProps(widgetProps);
  const commitValue = useCommitWidgetValue(widgetProps);

  if (isWidgetDisplayOnly(widgetProps)) {
    return (
      <View style={styles.widgetBlock}>
        <TextInput
          {...outlinedInputProps}
          value={displayValue}
          editable={false}
          onFocus={() => onFocus(id, value)}
          pointerEvents="auto"
        />
      </View>
    );
  }

  return (
    <View style={styles.widgetBlock}>
      <Pressable onPress={onOpen}>
        <TextInput
          {...outlinedInputProps}
          value={displayValue}
          editable={false}
          right={hasValue ? undefined : <TextInput.Icon icon={icon} />}
          onFocus={() => onFocus(id, value)}
          pointerEvents="none"
        />
      </Pressable>

      {hasValue && (
        <IconButton icon="close" size={20} onPress={() => commitValue(undefined)} style={styles.clearButton} />
      )}

      {children}
    </View>
  );
};

const useStyles = () => {
  const theme = useAppTheme();
  return StyleSheet.create({
    widgetBlock: {
      marginVertical: theme.spacing(0.5),
    },
    clearButton: {
      position: 'absolute',
      right: theme.spacing(0.5),
      top: theme.spacing(1.5),
    },
  });
};
