import { isBlank, isNotBlank } from '@lichens-innovation/ts-common';
import { ExpoSpeechRecognitionModule, useSpeechRecognitionEvent } from 'expo-speech-recognition';
import { FunctionComponent, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Keyboard, StyleSheet, View } from 'react-native';
import { IconButton, TextInput, TextInputProps } from 'react-native-paper';
import { logger } from '../../logger/logger';
import { useAppTheme } from '../../theme/theme';
import { buildFinalValue, ensureVoiceRecognitionPermissions } from './voice-recognition.utils';

interface VoiceRecognitionTextInputProps extends TextInputProps {
  label: string;
  value: string;
  onValueChange: (value: string) => void;
  onValueSubmit: (value: string) => void;
}

export const VoiceRecognitionTextInput: FunctionComponent<VoiceRecognitionTextInputProps> = ({
  label,
  value,
  onValueChange,
  onValueSubmit,
}) => {
  const styles = useStyles();
  const [isRecording, setIsRecording] = useState(false);
  const [recordingValue, setRecordingValue] = useState('');

  const { t } = useTranslation();
  const speechToTextLanguageCode = t('common:speechToTextLanguageCode');

  const finalValue = buildFinalValue({ query: value, recordingValue });

  const triggerOnSearch = () => {
    Keyboard.dismiss();
    onValueSubmit(finalValue.trim());
    setIsRecording(false);
    setRecordingValue('');
  };

  useSpeechRecognitionEvent('result', (event) => {
    if (!isRecording) return;

    const transcript = event.results[0].transcript;
    if (isNotBlank(transcript)) {
      setRecordingValue(transcript);
    }
  });

  useSpeechRecognitionEvent('error', (event) => {
    const { error, message } = event;
    logger.error(`[useSpeechRecognitionEvent] error: ${error} - ${message}`);
    setIsRecording(false);
    setRecordingValue('');
  });

  const handleStartRecording = async () => {
    const hasPermissions = await ensureVoiceRecognitionPermissions();
    if (!hasPermissions) return;

    setIsRecording(true);
    setRecordingValue('');

    Keyboard.dismiss();
    ExpoSpeechRecognitionModule.start({
      lang: speechToTextLanguageCode,
      interimResults: true,
      continuous: true,
    });
  };

  const handleStopRecording = async () => {
    if (!isRecording) return;
    setIsRecording(false);
    ExpoSpeechRecognitionModule.stop();

    if (isNotBlank(recordingValue)) {
      onValueChange(buildFinalValue({ query: value, recordingValue }));
    }
    setRecordingValue('');
  };

  const toggleRecording = () => {
    if (isRecording) {
      handleStopRecording();
    } else {
      handleStartRecording();
    }
  };

  const clearValue = () => {
    onValueChange('');
    setRecordingValue('');
  };

  return (
    <View style={styles.container}>
      <TextInput
        style={styles.textInput}
        label={label}
        value={finalValue}
        readOnly={isRecording}
        onChangeText={onValueChange}
        multiline={true}
        numberOfLines={4}
        left={<TextInput.Icon icon={isRecording ? 'stop' : 'microphone-outline'} onPress={toggleRecording} />}
        right={<TextInput.Icon icon="close" onPress={clearValue} disabled={isBlank(finalValue)} />}
      />
      <View style={styles.actionsContainer}>
        <IconButton
          icon="send"
          onPress={triggerOnSearch}
          disabled={isBlank(finalValue)}
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
    textInput: {
      flex: 1,
    },
    actionsContainer: {
      flexDirection: 'row',
    },
    sendIcon: {
      color: theme.colors.primary,
    },
  });
};
