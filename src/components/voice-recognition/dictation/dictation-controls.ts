import { ExpoSpeechRecognitionModule } from 'expo-speech-recognition';
import { logger } from '../../../logger/logger';
import { getOnDeviceSpeechEngine, OnDeviceSpeechEngine } from '../on-device-speech';
import { clearOwner, requestStart } from '../voice-recognition-coordinator';
import { ensureVoiceRecognitionPermissions } from '../voice-recognition.utils';
import { startOnDeviceSession, stopOnDeviceSession } from './dictation-on-device-engine';
import { commitTranscript, endSession } from './dictation-session';
import type { DictationRefs, DictationSessionContext } from './dictation-session.types';
import { startSystemSession, stopSystemRecognizer, stopSystemSession } from './dictation-system-engine';

const stopRecording = (
  ctx: DictationSessionContext,
  stopSystemEngine: (ctx: DictationSessionContext) => void
): void => {
  if (ctx.refs.phase.current !== 'recording') return;

  if (ctx.refs.isOnDevice.current) {
    /* habit-hooks-disable non-essential-comment
     * Transcribe what was captured instead of discarding it: nothing has been committed yet on
     * this path, so aborting would throw away the whole utterance.
     */
    void stopOnDeviceSession(ctx, ctx.refs.sessionToken.current);
    return;
  }
  stopSystemEngine(ctx);
};

const releaseSystemSession = (ctx: DictationSessionContext): void => {
  commitTranscript(ctx, ctx.recordingValue);
  ctx.refs.wantsAudioEnd.current = false;
  endSession(ctx);
};

export const preemptDictation = (ctx: DictationSessionContext): void => stopRecording(ctx, releaseSystemSession);

const abortRunningCapture = ({ phase, isOnDevice }: DictationRefs): void => {
  /* habit-hooks-disable non-essential-comment
   * preempt() already tore the session down and may have started transcribing; only abort
   * a capture that is genuinely still running.
   */
  if (phase.current !== 'recording') return;
  if (isOnDevice.current) getOnDeviceSpeechEngine()?.abortCapture();
  else ExpoSpeechRecognitionModule.abort();
};

const isOnDeviceEngineReady = (engine: OnDeviceSpeechEngine | null): engine is OnDeviceSpeechEngine => {
  try {
    return engine?.isReady() ?? false;
  } catch {
    return false;
  }
};

const startDictation = async (ctx: DictationSessionContext): Promise<void> => {
  const hasPermissions = await ensureVoiceRecognitionPermissions();
  if (!hasPermissions) return;

  const engine = getOnDeviceSpeechEngine();
  /* habit-hooks-disable non-essential-comment
   * isReady() only reports that the model is on disk. Loading it happens in the background while
   * the user is already talking, so pressing the microphone never waits on a model.
   */
  const onDeviceEngine = isOnDeviceEngineReady(engine) ? engine : null;

  const owner = {
    id: ctx.ownerId,
    preempt: () => ctx.refs.preempt.current(),
    abort: () => abortRunningCapture(ctx.refs),
  };
  await requestStart(owner, () => {
    ctx.refs.sessionToken.current += 1;
    const token = ctx.refs.sessionToken.current;

    if (onDeviceEngine) startOnDeviceSession(ctx, onDeviceEngine, token);
    else startSystemSession(ctx);
  });
};

export const toggleDictation = (ctx: DictationSessionContext): void => {
  if (ctx.phase === 'recording') {
    stopRecording(ctx, stopSystemSession);
    return;
  }

  startDictation(ctx).catch((error: unknown) => {
    logger.error('[VoiceRecognitionTextInput] dictation failed to start', error);
  });
};

const abortActiveCapture = ({ phase, isOnDevice }: DictationRefs): void => {
  if (phase.current === 'idle') return;

  if (isOnDevice.current && phase.current === 'recording') {
    getOnDeviceSpeechEngine()?.abortCapture();
  } else if (!isOnDevice.current || phase.current === 'fileFallback') {
    ExpoSpeechRecognitionModule.abort();
  }
};

export const clearDictation = (ctx: DictationSessionContext): void => {
  abortActiveCapture(ctx.refs);
  // Bumps the session token, so a transcription still running cannot resurrect what was cleared. habit-hooks-disable non-essential-comment
  endSession(ctx);
  ctx.setRecordingUri(null);
  ctx.onValueChange({ value: '' });
};

export const releaseDictationOnUnmount = (refs: DictationRefs, ownerId: string): void => {
  /* habit-hooks-disable non-essential-comment
   * Leaving the screen mid-capture must release the microphone. Without this the on-device
   * recorder stays open for the rest of the process and every later field silently falls back.
   */
  if (refs.phase.current === 'recording') {
    if (refs.isOnDevice.current) getOnDeviceSpeechEngine()?.abortCapture();
    else stopSystemRecognizer('Speech recognition stop() during unmount failed:');
  }
  refs.sessionToken.current += 1;
  if (refs.timeout.current) clearTimeout(refs.timeout.current);
  clearOwner(ownerId);
};
