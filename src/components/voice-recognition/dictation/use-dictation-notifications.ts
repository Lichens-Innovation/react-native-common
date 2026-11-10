import { useEffect } from 'react';
import type { DictationPhase, RecordingTextInputArgs } from './dictation-session.types';

const DICTATING_PHASES: ReadonlyArray<DictationPhase> = ['recording', 'transcribing', 'fileFallback'];

interface UseDictationNotificationsArgs {
  phase: DictationPhase;
  finalValue: string;
  effectiveRecordingUri?: string | null;
  onEffectiveValueChange?: (args: RecordingTextInputArgs) => void;
  onRecordingStateChange?: (isDictating: boolean) => void;
}

export const useDictationNotifications = ({
  phase,
  finalValue,
  effectiveRecordingUri,
  onEffectiveValueChange,
  onRecordingStateChange,
}: UseDictationNotificationsArgs): void => {
  useEffect(() => {
    onEffectiveValueChange?.({
      value: finalValue,
      recordingUri: effectiveRecordingUri ?? undefined,
    });
  }, [finalValue, effectiveRecordingUri, onEffectiveValueChange]);

  useEffect(() => {
    onRecordingStateChange?.(DICTATING_PHASES.includes(phase));
  }, [phase, onRecordingStateChange]);
};
