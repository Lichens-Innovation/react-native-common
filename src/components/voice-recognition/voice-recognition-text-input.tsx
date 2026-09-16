import { isBlank, isNotBlank, isNullish } from '@lichens-innovation/ts-common';
import { ExpoSpeechRecognitionModule, useSpeechRecognitionEvent } from 'expo-speech-recognition';
import { FunctionComponent, useEffect, useId, useRef, useState, useSyncExternalStore } from 'react';
import { useTranslation } from 'react-i18next';
import { ActivityIndicator, Keyboard, StyleSheet, View } from 'react-native';
import { IconButton, TextInput, TextInputProps } from 'react-native-paper';
import { logger } from '../../logger/logger';
import { RecordingPlayer } from './recording-player';
import {
  clearOwner,
  getDictationOwnerId,
  requestStart,
  subscribeToDictationOwner,
} from './voice-recognition-coordinator';
import { buildFinalValue, ensureVoiceRecognitionPermissions } from './voice-recognition.utils';
import { getOnDeviceSpeechEngine } from './on-device-speech';

export interface RecordingTextInputArgs {
  value: string;
  recordingUri?: string;
}

/**
 * Where a dictation session is.
 *
 * - `idle` — nothing running.
 * - `recording` — capturing, either engine.
 * - `awaitingAudioEnd` — system engine only: stopped, waiting for `audioend` to hand over the file
 *   it persisted. The text is already committed, so the field stays usable.
 * - `transcribing` — on-device engine only: stopped, the model is working. Seconds, not instant.
 * - `fileFallback` — an on-device attempt produced nothing, so its audio is being replayed through
 *   the system recogniser rather than thrown away.
 *
 * One value rather than several booleans: the failure paths cross each other (stop during
 * transcription, clear during fallback, unmount mid-capture) and independent flags let those
 * combinations strand the field in a state with no way back.
 */
type DictationPhase = 'idle' | 'recording' | 'awaitingAudioEnd' | 'transcribing' | 'fileFallback';

/**
 * `end` normally closes a file-fallback session. If the recogniser dies without emitting it, this
 * gets the field back rather than leaving a spinner forever.
 */
const FILE_FALLBACK_TIMEOUT_MS = 30_000;

/** Same idea for a system session whose `audioend` never arrives. */
const AUDIO_END_TIMEOUT_MS = 10_000;

interface SpeechRecognitionListenerProps {
  phase: DictationPhase;
  isSystemEngine: boolean;
  wantsAudioEndRef: React.RefObject<boolean>;
  lastFinalValueRef: React.RefObject<string>;
  setRecordingValue: (value: string) => void;
  onSystemAudioEnd: (uri: string | null) => void;
  onFileFallbackDone: () => void;
  onSystemError: () => void;
}

// Mounted only while a session is active so the native listeners don't sit attached on every text
// field in big forms (perf/memory).
const SpeechRecognitionListener: FunctionComponent<SpeechRecognitionListenerProps> = ({
  phase,
  isSystemEngine,
  wantsAudioEndRef,
  setRecordingValue,
  onSystemAudioEnd,
  onFileFallbackDone,
  onSystemError,
}) => {
  useSpeechRecognitionEvent('result', (event) => {
    const isLiveSystemDictation = phase === 'recording' && isSystemEngine;
    // A fallback session is not "recording", but its results are the entire point of it.
    if (!isLiveSystemDictation && phase !== 'fileFallback') return;

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
    wantsAudioEndRef.current = false;
    if (phase === 'fileFallback') onFileFallbackDone();
    else onSystemError();
  });

  useSpeechRecognitionEvent('audioend', (event) => {
    // A fallback session ends on `end`, not here. Android emits `audioend` and `end` as separate
    // events, so tearing down on `audioend` would unmount this listener before `end` arrived and
    // the fallback would never finish.
    if (phase === 'fileFallback') return;

    if (!wantsAudioEndRef.current) {
      onSystemAudioEnd(null);
      return;
    }
    wantsAudioEndRef.current = false;
    onSystemAudioEnd(event.uri ?? null);
  });

  useSpeechRecognitionEvent('end', () => {
    if (phase === 'fileFallback') onFileFallbackDone();
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
  /**
   * Notified while dictation is in progress, so a screen can disable actions that must not run
   * mid-dictation (submitting the form, picking media, editing the same field).
   *
   * Stays true through transcription, not just recording: on-device transcription lands seconds
   * after the user presses stop, and a form saved in that window would be missing the text.
   */
  onRecordingStateChange?: (isDictating: boolean) => void;
  /**
   * Whether the spoken audio is kept as a file and handed back through `onValueChange`'s
   * `recordingUri`. Default true, which is the long-standing behaviour. Set false on fields that
   * only want the text -- otherwise every dictation leaves a .wav behind in the cache directory.
   */
  persistRecording?: boolean;
  /** When true, shows the button that empties the field. Default: true. */
  showClear?: boolean;
  /** Long-press on the microphone, used to surface a help tooltip. */
  onMicLongPress?: () => void;
}

export const VoiceRecognitionTextInput: FunctionComponent<VoiceRecognitionTextInputProps> = ({
  label,
  value,
  onValueChange,
  onEffectiveValueChange,
  recordingUri: recordingUriProp,
  showPlayback = false,
  onRecordingStateChange,
  persistRecording = true,
  showClear = true,
  onMicLongPress,
  ...rest
}) => {
  const [phase, setPhase] = useState<DictationPhase>('idle');
  const [recordingValue, setRecordingValue] = useState('');
  const [recordingUri, setRecordingUri] = useState<string | null>(null);

  const lastFinalValueRef = useRef<string>('');
  const wantsAudioEndRef = useRef(false);
  const ownerId = useId();
  const preemptRef = useRef<() => void>(() => {});
  const isOnDeviceRef = useRef(false);
  const pendingAudioUriRef = useRef<string | null>(null);
  const timeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  // Mirrors `phase` for the callbacks the coordinator and the unmount cleanup invoke, which run
  // outside render and would otherwise read a stale value.
  const phaseRef = useRef<DictationPhase>('idle');
  /**
   * Invalidates in-flight work. Any async continuation captures the token it started with and does
   * nothing if it no longer matches, which is what stops a late transcription from writing into a
   * field the user has since cleared or handed to another engine.
   */
  const sessionTokenRef = useRef(0);

  const effectiveRecordingUri = isNullish(recordingUriProp) ? recordingUri : recordingUriProp;

  const { t } = useTranslation();
  const speechToTextLanguageCode = t('common:speechToTextLanguageCode');

  const finalValue = buildFinalValue({ query: value ?? '', recordingValue });
  const isRecording = phase === 'recording';
  const isBusy = phase === 'transcribing' || phase === 'fileFallback';

  /**
   * Another field is dictating. There is one microphone and one model behind all of these inputs,
   * and starting a second session while the first is mid-flight corrupted both -- the capture that
   * was already opening would be left running with nothing tracking it, and on-device transcription
   * stayed broken for the rest of the process. Locking the other microphones makes that
   * unreachable rather than merely recoverable.
   */
  const dictationOwnerId = useSyncExternalStore(subscribeToDictationOwner, getDictationOwnerId, getDictationOwnerId);
  const isLockedByAnotherField = dictationOwnerId !== null && dictationOwnerId !== ownerId;

  const goToPhase = (next: DictationPhase) => {
    phaseRef.current = next;
    setPhase(next);
  };

  const clearTimer = () => {
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
      timeoutRef.current = null;
    }
  };

  /** The single way back to idle. Everything that ends a session goes through here. */
  const endSession = () => {
    clearTimer();
    sessionTokenRef.current += 1;
    wantsAudioEndRef.current = false;
    isOnDeviceRef.current = false;
    pendingAudioUriRef.current = null;
    setRecordingValue('');
    goToPhase('idle');
    clearOwner(ownerId);
  };

  useEffect(() => {
    onEffectiveValueChange?.({
      value: finalValue,
      recordingUri: effectiveRecordingUri ?? undefined,
    });
  }, [finalValue, effectiveRecordingUri, onEffectiveValueChange]);

  useEffect(() => {
    onRecordingStateChange?.(phase === 'recording' || phase === 'transcribing' || phase === 'fileFallback');
  }, [phase, onRecordingStateChange]);

  useEffect(() => {
    return () => {
      // Leaving the screen mid-capture must release the microphone. Without this the on-device
      // recorder stays open for the rest of the process and every later field silently falls back.
      if (phaseRef.current === 'recording') {
        if (isOnDeviceRef.current) {
          getOnDeviceSpeechEngine()?.abortCapture();
        } else {
          try {
            ExpoSpeechRecognitionModule.stop();
          } catch (e) {
            logger.warn('Speech recognition stop() during unmount failed:', e);
          }
        }
      }
      sessionTokenRef.current += 1;
      if (timeoutRef.current) clearTimeout(timeoutRef.current);
      clearOwner(ownerId);
    };
  }, [ownerId]);

  const commitTranscript = (transcript: string, audioUri?: string) => {
    const committed = buildFinalValue({ query: value ?? '', recordingValue: transcript });
    lastFinalValueRef.current = committed;

    if (isNotBlank(transcript)) {
      onValueChange({ value: committed, ...(audioUri ? { recordingUri: audioUri } : {}) });
    }
    if (audioUri) setRecordingUri(audioUri);
  };

  // --- system engine -------------------------------------------------------

  const startSystemSession = () => {
    isOnDeviceRef.current = false;
    setRecordingValue('');
    setRecordingUri(null);
    goToPhase('recording');

    Keyboard.dismiss();
    const supportsPersist = persistRecording && ExpoSpeechRecognitionModule.supportsRecording();
    wantsAudioEndRef.current = !!supportsPersist;
    ExpoSpeechRecognitionModule.start({
      lang: speechToTextLanguageCode,
      interimResults: true,
      continuous: true,
      ...(supportsPersist && {
        recordingOptions: { persist: true },
      }),
    });
  };

  const stopSystemSession = () => {
    commitTranscript(recordingValue);
    setRecordingValue('');

    try {
      ExpoSpeechRecognitionModule.stop();
    } catch (e) {
      logger.warn('Speech recognition stop() failed:', e);
    }

    if (!wantsAudioEndRef.current) {
      endSession();
      return;
    }

    // The text is committed; only the persisted file is outstanding, so the field stays usable.
    goToPhase('awaitingAudioEnd');
    clearTimer();
    timeoutRef.current = setTimeout(() => {
      logger.warn('[VoiceRecognitionTextInput] audioend never arrived; releasing the session');
      endSession();
    }, AUDIO_END_TIMEOUT_MS);
  };

  const handleSystemAudioEnd = (uri: string | null) => {
    if (uri) {
      setRecordingUri(uri);
      onValueChange({ value: lastFinalValueRef.current, recordingUri: uri });
    }
    endSession();
  };

  // --- on-device engine ----------------------------------------------------

  const finishFileFallback = () => {
    if (phaseRef.current !== 'fileFallback') return;
    const audioUri = pendingAudioUriRef.current;
    const transcript = recordingValue;

    commitTranscript(transcript, persistRecording && audioUri ? audioUri : undefined);
    if (!persistRecording) getOnDeviceSpeechEngine()?.releaseLastAudio();
    endSession();
  };

  const startFileFallback = (audioUri: string) => {
    pendingAudioUriRef.current = audioUri;
    wantsAudioEndRef.current = false;
    setRecordingValue('');
    goToPhase('fileFallback');

    clearTimer();
    timeoutRef.current = setTimeout(() => {
      logger.warn('[VoiceRecognitionTextInput] file fallback timed out');
      finishFileFallback();
    }, FILE_FALLBACK_TIMEOUT_MS);

    try {
      ExpoSpeechRecognitionModule.start({
        lang: speechToTextLanguageCode,
        interimResults: false,
        continuous: true,
        audioSource: { uri: audioUri },
      });
    } catch (error) {
      logger.error('[VoiceRecognitionTextInput] file fallback failed to start', error);
      if (!persistRecording) getOnDeviceSpeechEngine()?.releaseLastAudio();
      endSession();
    }
  };

  const stopOnDeviceSession = async (token: number) => {
    const engine = getOnDeviceSpeechEngine();
    goToPhase('transcribing');

    let transcription = null;
    try {
      transcription = (await engine?.stopAndTranscribe({ keepAudio: persistRecording })) ?? null;
    } catch (error) {
      logger.error('[VoiceRecognitionTextInput] on-device transcription failed', error);
    }

    // The field was cleared, unmounted or handed to another engine while the model was working.
    if (sessionTokenRef.current !== token) {
      engine?.releaseLastAudio();
      return;
    }

    if (transcription && isNotBlank(transcription.text)) {
      commitTranscript(transcription.text, persistRecording ? transcription.audioUri : undefined);
      endSession();
      return;
    }

    // Nothing usable. If the audio survived, let the system recogniser have a go rather than
    // costing the user everything they just said.
    const audioUri = transcription?.audioUri ?? engine?.getLastAudioUri() ?? null;
    if (audioUri) {
      startFileFallback(audioUri);
      return;
    }

    endSession();
  };

  // --- shared --------------------------------------------------------------

  const preemptInstance = () => {
    if (phaseRef.current !== 'recording') return;

    if (isOnDeviceRef.current) {
      // Transcribe what was captured instead of discarding it: nothing has been committed yet on
      // this path, so aborting would throw away the whole utterance.
      void stopOnDeviceSession(sessionTokenRef.current);
      return;
    }

    commitTranscript(recordingValue);
    wantsAudioEndRef.current = false;
    endSession();
  };

  useEffect(() => {
    preemptRef.current = preemptInstance;
  });

  const handleStartRecording = async () => {
    const hasPermissions = await ensureVoiceRecognitionPermissions();
    if (!hasPermissions) return;

    const engine = getOnDeviceSpeechEngine();
    // isReady() only reports that the model is on disk. Loading it happens in the background while
    // the user is already talking, so pressing the microphone never waits on a model.
    let useOnDevice = false;
    try {
      useOnDevice = engine?.isReady() ?? false;
    } catch {
      useOnDevice = false;
    }

    await requestStart(
      {
        id: ownerId,
        preempt: () => preemptRef.current(),
        abort: () => {
          // preempt() already tore the session down and may have started transcribing; only abort
          // a capture that is genuinely still running.
          if (phaseRef.current !== 'recording') return;
          if (isOnDeviceRef.current) getOnDeviceSpeechEngine()?.abortCapture();
          else ExpoSpeechRecognitionModule.abort();
        },
      },
      () => {
        const token = ++sessionTokenRef.current;

        if (!useOnDevice || !engine) {
          startSystemSession();
          return;
        }

        isOnDeviceRef.current = true;
        wantsAudioEndRef.current = false;
        setRecordingValue('');
        setRecordingUri(null);
        goToPhase('recording');
        Keyboard.dismiss();

        engine
          .startCapture(() => {
            // The engine hit its own duration cap. Finish the session as though the user pressed
            // stop, so the text still arrives instead of the field appearing to record forever.
            if (sessionTokenRef.current === token && phaseRef.current === 'recording') {
              void stopOnDeviceSession(token);
            }
          })
          .then((started) => {
            if (sessionTokenRef.current !== token) {
              // This session was torn down while capture was still opening. The recorder is a
              // process-wide singleton, so a capture nobody is tracking any more would stay open
              // forever and every later field would silently fall back.
              if (started) getOnDeviceSpeechEngine()?.abortCapture();
              return;
            }
            // Capture refused (microphone busy or denied): drop to the system engine rather than
            // leaving a dead microphone button.
            if (!started) startSystemSession();
          })
          .catch((error: unknown) => {
            if (sessionTokenRef.current !== token) return;
            logger.error('[VoiceRecognitionTextInput] on-device capture failed to start', error);
            startSystemSession();
          });
      }
    );
  };

  const handleStopRecording = () => {
    if (phaseRef.current !== 'recording') return;

    if (isOnDeviceRef.current) {
      void stopOnDeviceSession(sessionTokenRef.current);
      return;
    }
    stopSystemSession();
  };

  const toggleRecording = () => {
    if (isRecording) {
      handleStopRecording();
    } else {
      void handleStartRecording();
    }
  };

  const clearValue = () => {
    if (phaseRef.current !== 'idle') {
      if (isOnDeviceRef.current && phaseRef.current === 'recording') {
        getOnDeviceSpeechEngine()?.abortCapture();
      } else if (!isOnDeviceRef.current || phaseRef.current === 'fileFallback') {
        ExpoSpeechRecognitionModule.abort();
      }
    }
    // Bumps the session token, so a transcription still running cannot resurrect what was cleared.
    endSession();
    setRecordingUri(null);
    onValueChange({ value: '' });
  };

  return (
    <View style={styles.container}>
      {phase !== 'idle' && (
        <SpeechRecognitionListener
          phase={phase}
          isSystemEngine={!isOnDeviceRef.current}
          wantsAudioEndRef={wantsAudioEndRef}
          lastFinalValueRef={lastFinalValueRef}
          setRecordingValue={setRecordingValue}
          onSystemAudioEnd={handleSystemAudioEnd}
          onFileFallbackDone={finishFileFallback}
          onSystemError={endSession}
        />
      )}
      <View style={styles.inputWrapper}>
        <TextInput
          {...rest}
          style={[
            styles.textInput,
            hasRightButtons(showPlayback, showClear) && styles.textInputWithRightButtons,
            rest.style,
          ]}
          label={label}
          value={finalValue}
          readOnly={isRecording || isBusy || !rest.editable}
          onChangeText={(text) => onValueChange({ value: text })}
        />
        <View style={styles.rightButtonsOverlay} pointerEvents="box-none">
          <View style={styles.rightButtons} pointerEvents="auto">
            {showPlayback && <RecordingPlayer recordingUri={effectiveRecordingUri} />}
            {showClear && (
              <IconButton
                icon="close"
                onPress={clearValue}
                disabled={isBlank(finalValue) || !rest.editable}
                accessibilityLabel={t('common:close')}
              />
            )}
          </View>
        </View>
      </View>
      {isBusy ? (
        // Transcription runs for a few seconds after stop; without this the field just sits there
        // looking broken.
        <ActivityIndicator size={28} style={styles.micButton} testID="dictation-busy" />
      ) : (
        <IconButton
          mode="contained"
          size={28}
          hitSlop={{ top: 12, bottom: 12, left: 12, right: 12 }}
          icon={isRecording ? 'stop' : 'microphone-outline'}
          onPress={toggleRecording}
          onLongPress={onMicLongPress}
          disabled={!rest.editable || isLockedByAnotherField}
          style={styles.micButton}
          testID="dictation-mic"
        />
      )}
    </View>
  );
};

/** Playback and clear sit on top of the input, so room is only reserved when one is rendered. */
const hasRightButtons = (showPlayback: boolean, showClear: boolean) => showPlayback || showClear;

const RIGHT_BUTTONS_WIDTH = 64;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
  },
  inputWrapper: {
    position: 'relative',
    flex: 1,
  },
  micButton: {
    marginLeft: 4,
    marginRight: -4,
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
