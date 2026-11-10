import { useState } from 'react';
import type { DictationPhase, DictationState } from './dictation-session.types';

export const useDictationState = (): DictationState => {
  const [phase, setPhase] = useState<DictationPhase>('idle');
  const [recordingValue, setRecordingValue] = useState('');
  const [recordingUri, setRecordingUri] = useState<string | null>(null);

  return { phase, setPhase, recordingValue, setRecordingValue, recordingUri, setRecordingUri };
};
