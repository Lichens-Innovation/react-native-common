import { isBlank } from '@lichens-innovation/ts-common';
import { FunctionComponent, ComponentProps, useState } from 'react';
import { Keyboard, StyleSheet, View } from 'react-native';
import { IconButton } from 'react-native-paper';
import { useAppTheme } from '../../theme/theme';
import type { RecordingTextInputArgs } from './voice-recognition-text-input';
import { VoiceRecognitionTextInput } from './voice-recognition-text-input';

type VoiceRecognitionTextInputSubmitProps = Omit<
  ComponentProps<typeof VoiceRecognitionTextInput>,
  'onEffectiveValueChange'
> & {
  /** Called when send is pressed with the currently displayed effective value (and recording URI if present). */
  onValueSubmit: (args: RecordingTextInputArgs) => void;
};

export const VoiceRecognitionTextInputSubmit: FunctionComponent<VoiceRecognitionTextInputSubmitProps> = ({
  onValueChange,
  onValueSubmit,
  ...rest
}) => {
  const styles = useStyles();
  const [effectiveValue, setEffectiveValue] = useState('');
  const [effectiveRecordingUri, setEffectiveRecordingUri] = useState<string | undefined>(undefined);

  const handleEffectiveValueChange = ({ value, recordingUri }: RecordingTextInputArgs) => {
    setEffectiveValue(value);
    setEffectiveRecordingUri(recordingUri);
  };

  const handleSubmit = () => {
    Keyboard.dismiss();
    onValueSubmit({ value: effectiveValue.trim(), recordingUri: effectiveRecordingUri });
  };

  return (
    <View style={styles.container}>
      <VoiceRecognitionTextInput
        {...rest}
        onValueChange={onValueChange}
        onEffectiveValueChange={handleEffectiveValueChange}
      />
      <View style={styles.actionsContainer}>
        <IconButton
          icon="send"
          onPress={handleSubmit}
          disabled={isBlank(effectiveValue)}
          iconColor={styles.sendIcon.color}
        />
      </View>
    </View>
  );
};

const useStyles = () => {
  const theme = useAppTheme();

  return StyleSheet.create({
    container: {
      flexDirection: 'row',
    },
    actionsContainer: {
      flexDirection: 'row',
    },
    sendIcon: {
      color: theme.colors.primary,
    },
  });
};
