import { isBlank } from '@lichens-innovation/ts-common';
import { FunctionComponent } from 'react';
import { StyleSheet, View } from 'react-native';
import { TextInputProps } from 'react-native-paper';
import { DictationMicButton } from './dictation/dictation-mic-button';
import type { MicPosition, RecordingTextInputArgs } from './dictation/dictation-session.types';
import { DictationTextField } from './dictation/dictation-text-field';
import { SpeechRecognitionListener } from './dictation/speech-recognition-listener';
import { useDictationSession } from './dictation/use-dictation-session';

export type { RecordingTextInputArgs } from './dictation/dictation-session.types';

interface VoiceRecognitionTextInputProps extends TextInputProps {
  /** Committed value to persist: called when an action completes (typing, stop recording, clear). Source of truth for parent state. habit-hooks-disable non-essential-comment */
  onValueChange: (args: RecordingTextInputArgs) => void;
  /** Currently displayed value: called on every change (including live transcription). Used for submit button state and payload on click. habit-hooks-disable non-essential-comment */
  onEffectiveValueChange?: (args: RecordingTextInputArgs) => void;
  /** When provided, overrides the internal recording URI (e.g. to restore a draft with an existing recording). habit-hooks-disable non-essential-comment */
  recordingUri?: string | null;
  /** Default: false. habit-hooks-disable non-essential-comment */
  showPlayback?: boolean;
  /** habit-hooks-disable non-essential-comment
   * Notified while dictation is in progress, so a screen can disable actions that must not run
   * mid-dictation (submitting the form, picking media, editing the same field).
   *
   * Stays true through transcription, not just recording: on-device transcription lands seconds
   * after the user presses stop, and a form saved in that window would be missing the text.
   */
  onRecordingStateChange?: (isDictating: boolean) => void;
  /** habit-hooks-disable non-essential-comment
   * Whether the spoken audio is kept as a file and handed back through `onValueChange`'s
   * `recordingUri`. Default true, which is the long-standing behaviour. Set false on fields that
   * only want the text -- otherwise every dictation leaves a .wav behind in the cache directory.
   */
  persistRecording?: boolean;
  /** Default: true. habit-hooks-disable non-essential-comment */
  showClear?: boolean;
  onMicLongPress?: () => void;
  /** habit-hooks-disable non-essential-comment
   * Where the microphone sits. `right` (the default) keeps it beside the field; `below` gives it its
   * own row under the field, larger, for a screen with room to spare and a field that should not
   * lose its width to the button.
   */
  micPosition?: MicPosition;
}

export const VoiceRecognitionTextInput: FunctionComponent<VoiceRecognitionTextInputProps> = ({
  value,
  onValueChange,
  onEffectiveValueChange,
  recordingUri,
  showPlayback = false,
  onRecordingStateChange,
  persistRecording = true,
  showClear = true,
  onMicLongPress,
  micPosition = 'right',
  ...rest
}) => {
  const dictation = useDictationSession({
    query: value ?? '',
    recordingUriProp: recordingUri,
    persistRecording,
    onValueChange,
    onEffectiveValueChange,
    onRecordingStateChange,
  });
  const { session, finalValue, isRecording, isBusy } = dictation;
  const isNotEditable = !rest.editable;

  return (
    <View style={micPosition === 'below' ? styles.containerBelow : styles.container}>
      {session.phase !== 'idle' && (
        <SpeechRecognitionListener session={session} isSystemEngine={!session.refs.isOnDevice.current} />
      )}
      <DictationTextField
        {...rest}
        value={finalValue}
        readOnly={isRecording || isBusy || isNotEditable}
        onChangeText={(text) => onValueChange({ value: text })}
        micPosition={micPosition}
        showPlayback={showPlayback}
        showClear={showClear}
        recordingUri={dictation.effectiveRecordingUri}
        isClearDisabled={isBlank(finalValue) || isNotEditable}
        onClear={dictation.clearValue}
      />
      <DictationMicButton
        micPosition={micPosition}
        isBusy={isBusy}
        isRecording={isRecording}
        disabled={isNotEditable || dictation.isLockedByAnotherField}
        onPress={dictation.toggleRecording}
        onLongPress={onMicLongPress}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
  },
  containerBelow: {
    gap: 12,
  },
});
