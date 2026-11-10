import { isNotBlank } from '@lichens-innovation/ts-common';
import { ExpoSpeechRecognitionModule } from 'expo-speech-recognition';
import { logger } from '../../../logger/logger';
import { getOnDeviceSpeechEngine, OnDeviceSpeechEngine, OnDeviceTranscription } from '../on-device-speech';
import {
  armSessionTimeout,
  commitTranscript,
  endSession,
  enterRecordingPhase,
  goToPhase,
  releaseUnpersistedAudio,
} from './dictation-session';
import type { DictationSessionContext } from './dictation-session.types';
import { startSystemSession } from './dictation-system-engine';

/** `end` normally closes a file-fallback session. If the recogniser dies without emitting it, this habit-hooks-disable non-essential-comment
 * gets the field back rather than leaving a spinner forever.
 */
const FILE_FALLBACK_TIMEOUT_MS = 30_000;

export const finishFileFallback = (ctx: DictationSessionContext): void => {
  if (ctx.refs.phase.current !== 'fileFallback') return;
  const audioUri = ctx.refs.pendingAudioUri.current;

  commitTranscript(ctx, ctx.recordingValue, ctx.persistRecording && audioUri ? audioUri : undefined);
  releaseUnpersistedAudio(ctx);
  endSession(ctx);
};

const startFileFallback = (ctx: DictationSessionContext, audioUri: string): void => {
  ctx.refs.pendingAudioUri.current = audioUri;
  ctx.refs.wantsAudioEnd.current = false;
  ctx.setRecordingValue('');
  goToPhase(ctx, 'fileFallback');

  armSessionTimeout(ctx.refs, FILE_FALLBACK_TIMEOUT_MS, () => {
    logger.warn('[VoiceRecognitionTextInput] file fallback timed out');
    finishFileFallback(ctx);
  });

  try {
    ExpoSpeechRecognitionModule.start({
      lang: ctx.languageCode,
      interimResults: false,
      continuous: true,
      audioSource: { uri: audioUri },
    });
  } catch (error) {
    logger.error('[VoiceRecognitionTextInput] file fallback failed to start', error);
    releaseUnpersistedAudio(ctx);
    endSession(ctx);
  }
};

const transcribeCapture = async (
  engine: OnDeviceSpeechEngine | null,
  keepAudio: boolean
): Promise<OnDeviceTranscription | null> => {
  try {
    const transcription = await engine?.stopAndTranscribe({ keepAudio });
    return transcription ?? null;
  } catch (error) {
    logger.error('[VoiceRecognitionTextInput] on-device transcription failed', error);
    return null;
  }
};

export const stopOnDeviceSession = async (ctx: DictationSessionContext, token: number): Promise<void> => {
  const engine = getOnDeviceSpeechEngine();
  goToPhase(ctx, 'transcribing');
  const transcription = await transcribeCapture(engine, ctx.persistRecording);

  // The field was cleared, unmounted or handed to another engine while the model was working. habit-hooks-disable non-essential-comment
  if (ctx.refs.sessionToken.current !== token) {
    engine?.releaseLastAudio();
    return;
  }

  if (transcription && isNotBlank(transcription.text)) {
    commitTranscript(ctx, transcription.text, ctx.persistRecording ? transcription.audioUri : undefined);
    endSession(ctx);
    return;
  }

  /* habit-hooks-disable non-essential-comment
   * Nothing usable. If the audio survived, let the system recogniser have a go rather than
   * costing the user everything they just said.
   */
  const audioUri = transcription?.audioUri ?? engine?.getLastAudioUri() ?? null;
  if (audioUri) {
    startFileFallback(ctx, audioUri);
    return;
  }

  endSession(ctx);
};

const handleCaptureStarted = (ctx: DictationSessionContext, token: number, started: boolean): void => {
  if (ctx.refs.sessionToken.current !== token) {
    /* habit-hooks-disable non-essential-comment
     * This session was torn down while capture was still opening. The recorder is a
     * process-wide singleton, so a capture nobody is tracking any more would stay open
     * forever and every later field would silently fall back.
     */
    if (started) getOnDeviceSpeechEngine()?.abortCapture();
    return;
  }
  /* habit-hooks-disable non-essential-comment
   * Capture refused (microphone busy or denied): drop to the system engine rather than
   * leaving a dead microphone button.
   */
  if (!started) startSystemSession(ctx);
};

export const startOnDeviceSession = (
  ctx: DictationSessionContext,
  engine: OnDeviceSpeechEngine,
  token: number
): void => {
  enterRecordingPhase(ctx, true);

  const handleAutoStop = () => {
    /* habit-hooks-disable non-essential-comment
     * The engine hit its own duration cap. Finish the session as though the user pressed
     * stop, so the text still arrives instead of the field appearing to record forever.
     */
    if (ctx.refs.sessionToken.current === token && ctx.refs.phase.current === 'recording') {
      void stopOnDeviceSession(ctx, token);
    }
  };

  engine
    .startCapture(handleAutoStop)
    .then((started) => handleCaptureStarted(ctx, token, started))
    .catch((error: unknown) => {
      if (ctx.refs.sessionToken.current !== token) return;
      logger.error('[VoiceRecognitionTextInput] on-device capture failed to start', error);
      startSystemSession(ctx);
    });
};
