import { isBlank, isNotBlank, isNullish } from '@lichens-innovation/ts-common';
import { ExpoSpeechRecognitionModule, useSpeechRecognitionEvent } from 'expo-speech-recognition';
import { FunctionComponent, RefObject, useEffect, useId, useRef, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Keyboard, StyleSheet, View } from 'react-native';
import { IconButton, TextInput, TextInputProps } from 'react-native-paper';
import { logger } from '../../logger/logger';
import { RecordingPlayer } from './recording-player';
import { clearOwner, requestStart } from './voice-recognition-coordinator';
import { buildFinalValue, ensureVoiceRecognitionPermissions } from './voice-recognition.utils';

export interface RecordingTextInputArgs {
  value: string;
  recordingUri?: string;
}

interface SpeechRecognitionListenerProps {
  isRecording: boolean;
  shouldHandleAudioEndRef: RefObject<boolean>;
  lastFinalValueRef: RefObject<string>;
  setRecordingValue: (value: string) => void;
  setRecordingUri: (value: string | null) => void;
  setIsRecording: (value: boolean) => void;
  setIsSessionActive: (value: boolean) => void;
  onValueChange: (args: RecordingTextInputArgs) => void;
}

// Mounted only while a speech-recognition session is active so the 3 native
// listeners don't sit attached on every text field in big forms (perf/memory).
const SpeechRecognitionListener: FunctionComponent<SpeechRecognitionListenerProps> = ({
  isRecording,
  shouldHandleAudioEndRef,
  lastFinalValueRef,
  setRecordingValue,
  setRecordingUri,
  setIsRecording,
  setIsSessionActive,
  onValueChange,
}) => {
  useSpeechRecognitionEvent('result', (event) => {
    if (!isRecording) return;

    const transcript = event.results?.[0]?.transcript ?? '';
    if (isNotBlank(transcript)) {
      setRecordingValue(transcript);
    }
  });

  useSpeechRecognitionEvent('error', (event) => {
    const { error, message } = event;
    if (error !== 'aborted') {
      logger.error(`[useSpeechRecognitionEvent] error: ${error} - ${message}`);
    }
    shouldHandleAudioEndRef.current = false;
    setIsRecording(false);
    setRecordingValue('');
    setIsSessionActive(false);
  });

  useSpeechRecognitionEvent('audioend', (event) => {
    if (!shouldHandleAudioEndRef.current) {
      setIsSessionActive(false);
      return;
    }
    shouldHandleAudioEndRef.current = false;

    if (event.uri) {
      setRecordingUri(event.uri);
      onValueChange({
        value: lastFinalValueRef.current,
        recordingUri: event.uri,
      });
    }
    setIsSessionActive(false);
  });

  return null;
};

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
  const [isSessionActive, setIsSessionActive] = useState(false);
  const [recordingValue, setRecordingValue] = useState('');
  const [recordingUri, setRecordingUri] = useState<string | null>(null);

  const lastFinalValueRef = useRef<string>('');
  const shouldHandleAudioEndRef = useRef(false);
  const ownerId = useId();
  const preemptRef = useRef<() => void>(() => {});

  const effectiveRecordingUri = isNullish(recordingUriProp) ? recordingUri : recordingUriProp;

  const { t } = useTranslation();
  const speechToTextLanguageCode = t('common:speechToTextLanguageCode');

  const finalValue = buildFinalValue({ query: value ?? '', recordingValue });

  useEffect(() => {
    onEffectiveValueChange?.({
      value: finalValue,
      recordingUri: effectiveRecordingUri ?? undefined,
    });
  }, [finalValue, effectiveRecordingUri, onEffectiveValueChange]);

  useEffect(() => {
    return () => {
      clearOwner(ownerId);
    };
  }, [ownerId]);

  const preemptInstance = () => {
    const finalValueAtPreempt = buildFinalValue({ query: value ?? '', recordingValue });
    lastFinalValueRef.current = finalValueAtPreempt;
    shouldHandleAudioEndRef.current = false;
    if (isNotBlank(recordingValue)) {
      onValueChange({ value: finalValueAtPreempt });
    }
    setRecordingValue('');
    setIsRecording(false);
    setIsSessionActive(false);
  };

  useEffect(() => {
    preemptRef.current = preemptInstance;
  });

  const handleStartRecording = async () => {
    const hasPermissions = await ensureVoiceRecognitionPermissions();
    if (!hasPermissions) return;

    await requestStart({ id: ownerId, preempt: () => preemptRef.current() }, () => {
      shouldHandleAudioEndRef.current = true;
      setIsSessionActive(true);
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
    });
  };

  const handleStopRecording = async () => {
    if (!isRecording) return;

    const finalValueAtStop = buildFinalValue({ query: value ?? '', recordingValue });
    lastFinalValueRef.current = finalValueAtStop;

    setIsRecording(false);
    ExpoSpeechRecognitionModule.stop();

    if (isNotBlank(recordingValue)) {
      onValueChange({ value: finalValueAtStop });
    }

    setRecordingValue('');
    clearOwner(ownerId);
  };

  const toggleRecording = () => {
    if (isRecording) {
      handleStopRecording();
    } else {
      handleStartRecording();
    }
  };

  const clearValue = () => {
    if (isSessionActive) {
      shouldHandleAudioEndRef.current = false;
      ExpoSpeechRecognitionModule.abort();
    }
    setIsSessionActive(false);
    setIsRecording(false);
    onValueChange({ value: '' });
    setRecordingValue('');
    setRecordingUri(null);
    clearOwner(ownerId);
  };

  return (
    <View style={styles.container}>
      {isSessionActive && (
        <SpeechRecognitionListener
          isRecording={isRecording}
          shouldHandleAudioEndRef={shouldHandleAudioEndRef}
          lastFinalValueRef={lastFinalValueRef}
          setRecordingValue={setRecordingValue}
          setRecordingUri={setRecordingUri}
          setIsRecording={setIsRecording}
          setIsSessionActive={setIsSessionActive}
          onValueChange={onValueChange}
        />
      )}
      <View style={styles.inputWrapper}>
        <TextInput
          {...rest}
          style={[styles.textInput, styles.textInputWithRightButtons]}
          label={label}
          value={finalValue}
          readOnly={isRecording || !rest.editable}
          onChangeText={(text) => onValueChange({ value: text })}
          left={
            <TextInput.Icon
              icon={isRecording ? 'stop' : 'microphone-outline'}
              onPress={toggleRecording}
              disabled={!rest.editable}
            />
          }
        />
        <View style={styles.rightButtonsOverlay} pointerEvents="box-none">
          <View style={styles.rightButtons} pointerEvents="auto">
            {showPlayback && <RecordingPlayer recordingUri={effectiveRecordingUri} />}
            <IconButton
              icon="close"
              onPress={clearValue}
              disabled={isBlank(finalValue) || !rest.editable}
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
