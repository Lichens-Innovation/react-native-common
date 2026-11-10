import { isNotBlank } from '@lichens-innovation/ts-common';
import { Keyboard } from 'react-native';
import { getOnDeviceSpeechEngine } from '../on-device-speech';
import { clearOwner } from '../voice-recognition-coordinator';
import { buildFinalValue } from '../voice-recognition.utils';
import type { DictationPhase, DictationRefs, DictationSessionContext } from './dictation-session.types';

export const createDictationRefs = (): DictationRefs => ({
  lastFinalValue: { current: '' },
  wantsAudioEnd: { current: false },
  preempt: { current: () => {} },
  isOnDevice: { current: false },
  pendingAudioUri: { current: null },
  timeout: { current: null },
  phase: { current: 'idle' },
  sessionToken: { current: 0 },
});

export const goToPhase = ({ refs, setPhase }: DictationSessionContext, next: DictationPhase): void => {
  refs.phase.current = next;
  setPhase(next);
};

const clearSessionTimer = ({ timeout }: DictationRefs): void => {
  if (timeout.current) {
    clearTimeout(timeout.current);
    timeout.current = null;
  }
};

export const armSessionTimeout = (refs: DictationRefs, timeoutMs: number, onTimeout: () => void): void => {
  clearSessionTimer(refs);
  refs.timeout.current = setTimeout(onTimeout, timeoutMs);
};

export const enterRecordingPhase = (ctx: DictationSessionContext, isOnDevice: boolean): void => {
  ctx.refs.isOnDevice.current = isOnDevice;
  ctx.refs.wantsAudioEnd.current = false;
  ctx.setRecordingValue('');
  ctx.setRecordingUri(null);
  goToPhase(ctx, 'recording');
  Keyboard.dismiss();
};

export const endSession = (ctx: DictationSessionContext): void => {
  const { refs } = ctx;
  clearSessionTimer(refs);
  refs.sessionToken.current += 1;
  refs.wantsAudioEnd.current = false;
  refs.isOnDevice.current = false;
  refs.pendingAudioUri.current = null;
  ctx.setRecordingValue('');
  goToPhase(ctx, 'idle');
  clearOwner(ctx.ownerId);
};

export const commitTranscript = (ctx: DictationSessionContext, transcript: string, audioUri?: string): void => {
  const committed = buildFinalValue({ query: ctx.query, recordingValue: transcript });
  ctx.refs.lastFinalValue.current = committed;

  if (isNotBlank(transcript)) {
    ctx.onValueChange({ value: committed, ...(audioUri ? { recordingUri: audioUri } : {}) });
  }
  if (audioUri) ctx.setRecordingUri(audioUri);
};

export const releaseUnpersistedAudio = ({ persistRecording }: DictationSessionContext): void => {
  if (!persistRecording) getOnDeviceSpeechEngine()?.releaseLastAudio();
};
