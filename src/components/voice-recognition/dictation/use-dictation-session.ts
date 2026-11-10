import { isNullish } from '@lichens-innovation/ts-common';
import { useId, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { buildFinalValue } from '../voice-recognition.utils';
import { clearDictation, toggleDictation } from './dictation-controls';
import { createDictationRefs } from './dictation-session';
import type { DictationPhase, DictationSessionContext, RecordingTextInputArgs } from './dictation-session.types';
import { useDictationLifecycle } from './use-dictation-lifecycle';
import { useDictationLock } from './use-dictation-lock';
import { useDictationNotifications } from './use-dictation-notifications';
import { useDictationState } from './use-dictation-state';

const BUSY_PHASES: ReadonlyArray<DictationPhase> = ['transcribing', 'fileFallback'];

export interface UseDictationSessionArgs {
  query: string;
  recordingUriProp?: string | null;
  persistRecording: boolean;
  onValueChange: (args: RecordingTextInputArgs) => void;
  onEffectiveValueChange?: (args: RecordingTextInputArgs) => void;
  onRecordingStateChange?: (isDictating: boolean) => void;
}

export const useDictationSession = ({ recordingUriProp, ...args }: UseDictationSessionArgs) => {
  const state = useDictationState();
  const [refs] = useState(createDictationRefs);
  const ownerId = useId();
  const { t } = useTranslation();
  const isLockedByAnotherField = useDictationLock(ownerId);
  const session: DictationSessionContext = {
    ...args,
    ...state,
    refs,
    ownerId,
    languageCode: t('common:speechToTextLanguageCode'),
  };
  const finalValue = buildFinalValue({ query: args.query, recordingValue: state.recordingValue });
  const effectiveRecordingUri = isNullish(recordingUriProp) ? state.recordingUri : recordingUriProp;

  useDictationNotifications({ ...args, phase: state.phase, finalValue, effectiveRecordingUri });
  useDictationLifecycle(session);

  return {
    session,
    finalValue,
    effectiveRecordingUri,
    isRecording: state.phase === 'recording',
    isBusy: BUSY_PHASES.includes(state.phase),
    isLockedByAnotherField,
    toggleRecording: () => toggleDictation(session),
    clearValue: () => clearDictation(session),
  };
};
