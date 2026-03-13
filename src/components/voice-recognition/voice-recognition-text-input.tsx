import { isBlank, isNotBlank, isNullish } from '@lichens-innovation/ts-common';
import { ExpoSpeechRecognitionModule, useSpeechRecognitionEvent } from 'expo-speech-recognition';
import { FunctionComponent, useEffect, useRef, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Keyboard, StyleSheet, View } from 'react-native';
import { IconButton, TextInput, TextInputProps } from 'react-native-paper';
import { logger } from '../../logger/logger';
import { RecordingPlayer } from './recording-player';
import { buildFinalValue, ensureVoiceRecognitionPermissions } from './voice-recognition.utils';

export interface RecordingTextInputArgs {
  value: string;
  recordingUri?: string;
}

interface VoiceRecognitionTextInputProps extends TextInputProps {
  /** Committed value to persist: called when an action completes (typing, stop recording, clear). Source of truth for parent state. */
  onValueChange: (args: RecordingTextInputArgs) => void;
  /** Currently displayed value: called on every change (including live transcription). Used for submit button state and payload on click. */
  onEffectiveValueChange?: (args: RecordingTextInputArgs) => void;
  /** When provided, overrides the internal recording URI (e.g. to restore a draft with an existing recording). */
  recordingUri?: string | null;
  /** When true, shows the playback button to replay the recording. Default: false. */
  showPlayback?: boolean;
}

export const VoiceRecognitionTextInput: FunctionComponent<VoiceRecognitionTextInputProps> = ({
  label,
  value,
  onValueChange,
  onEffectiveValueChange,
  recordingUri: recordingUriProp,
  showPlayback = false,
  ...rest
}) => {
  const [isRecording, setIsRecording] = useState(false);
  const [recordingValue, setRecordingValue] = useState('');
  const [recordingUri, setRecordingUri] = useState<string | null>(null);
  const lastFinalValueRef = useRef<string>('');

  const effectiveRecordingUri = isNullish(recordingUriProp) ? recordingUri : recordingUriProp;

  const { t } = useTranslation();
  const speechToTextLanguageCode = t('common:speechToTextLanguageCode');

  const finalValue = buildFinalValue({ query: value ?? '', recordingValue });

  useEffect(() => {
    onEffectiveValueChange?.({ value: finalValue, recordingUri: effectiveRecordingUri ?? undefined });
  }, [finalValue, effectiveRecordingUri, onEffectiveValueChange]);

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

  useSpeechRecognitionEvent('audioend', (event) => {
    if (event.uri) {
      setRecordingUri(event.uri);
      onValueChange({ value: lastFinalValueRef.current, recordingUri: event.uri });
    }
  });

  const handleStartRecording = async () => {
    const hasPermissions = await ensureVoiceRecognitionPermissions();
    if (!hasPermissions) return;

    setIsRecording(true);
    setRecordingValue('');
    setRecordingUri(null);

    Keyboard.dismiss();
    const supportsPersist = ExpoSpeechRecognitionModule.supportsRecording();
    ExpoSpeechRecognitionModule.start({
      lang: speechToTextLanguageCode,
      interimResults: true,
      continuous: true,
      ...(supportsPersist && {
        recordingOptions: { persist: true },
      }),
    });
  };

  const handleStopRecording = async () => {
    if (!isRecording) return;
    setIsRecording(false);
    ExpoSpeechRecognitionModule.stop();

    const finalValueAtStop = buildFinalValue({ query: value ?? '', recordingValue });
    lastFinalValueRef.current = finalValueAtStop;
    if (isNotBlank(recordingValue)) {
      onValueChange({ value: finalValueAtStop });
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
    onValueChange({ value: '' });
    setRecordingValue('');
    setRecordingUri(null);
  };

  return (
    <View style={styles.container}>
      <View style={styles.inputWrapper}>
        <TextInput
          {...rest}
          style={[styles.textInput, styles.textInputWithRightButtons]}
          label={label}
          value={finalValue}
          readOnly={isRecording}
          onChangeText={(text) => onValueChange({ value: text })}
          multiline={true}
          numberOfLines={4}
          left={<TextInput.Icon icon={isRecording ? 'stop' : 'microphone-outline'} onPress={toggleRecording} />}
        />
        <View style={styles.rightButtonsOverlay} pointerEvents="box-none">
          <View style={styles.rightButtons} pointerEvents="auto">
            {showPlayback && <RecordingPlayer recordingUri={effectiveRecordingUri} />}
            <IconButton
              icon="close"
              onPress={clearValue}
              disabled={isBlank(finalValue)}
              accessibilityLabel={t('common:close')}
            />
          </View>
        </View>
      </View>
    </View>
  );
};

const RIGHT_BUTTONS_WIDTH = 64;

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  inputWrapper: {
    position: 'relative',
    flex: 1,
  },
  textInput: {
    flex: 1,
  },
  textInputWithRightButtons: {
    paddingRight: RIGHT_BUTTONS_WIDTH,
  },
  rightButtonsOverlay: {
    position: 'absolute',
    top: 0,
    right: 0,
    bottom: 0,
    justifyContent: 'center',
  },
  rightButtons: {
    flexDirection: 'row',
  },
});
