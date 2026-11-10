import { ExpoSpeechRecognitionModule } from 'expo-speech-recognition';
import { logger } from '../../../logger/logger';
import { armSessionTimeout, commitTranscript, endSession, enterRecordingPhase, goToPhase } from './dictation-session';
import type { DictationSessionContext } from './dictation-session.types';

const AUDIO_END_TIMEOUT_MS = 10_000;

export const stopSystemRecognizer = (failureMessage: string): void => {
  try {
    ExpoSpeechRecognitionModule.stop();
  } catch (e) {
    logger.warn(failureMessage, e);
  }
};

export const startSystemSession = (ctx: DictationSessionContext): void => {
  enterRecordingPhase(ctx, false);
  const supportsPersist = ctx.persistRecording && ExpoSpeechRecognitionModule.supportsRecording();
  ctx.refs.wantsAudioEnd.current = supportsPersist;
  ExpoSpeechRecognitionModule.start({
    lang: ctx.languageCode,
    interimResults: true,
    continuous: true,
    ...(supportsPersist && {
      recordingOptions: { persist: true },
    }),
  });
};

export const stopSystemSession = (ctx: DictationSessionContext): void => {
  commitTranscript(ctx, ctx.recordingValue);
  ctx.setRecordingValue('');
  stopSystemRecognizer('Speech recognition stop() failed:');

  if (!ctx.refs.wantsAudioEnd.current) {
    endSession(ctx);
    return;
  }

  // The text is committed; only the persisted file is outstanding, so the field stays usable. habit-hooks-disable non-essential-comment
  goToPhase(ctx, 'awaitingAudioEnd');
  armSessionTimeout(ctx.refs, AUDIO_END_TIMEOUT_MS, () => {
    logger.warn('[VoiceRecognitionTextInput] audioend never arrived; releasing the session');
    endSession(ctx);
  });
};

export const handleSystemAudioEnd = (ctx: DictationSessionContext, uri: string | null): void => {
  if (uri) {
    ctx.setRecordingUri(uri);
    ctx.onValueChange({ value: ctx.refs.lastFinalValue.current, recordingUri: uri });
  }
  endSession(ctx);
};
