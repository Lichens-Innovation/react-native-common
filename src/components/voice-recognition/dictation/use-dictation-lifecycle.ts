import { useEffect } from 'react';
import { preemptDictation, releaseDictationOnUnmount } from './dictation-controls';
import type { DictationSessionContext } from './dictation-session.types';

export const useDictationLifecycle = (session: DictationSessionContext): void => {
  const { ownerId, refs } = session;
  const { preempt: preemptRef } = refs;

  useEffect(() => () => releaseDictationOnUnmount(refs, ownerId), [refs, ownerId]);

  useEffect(() => {
    preemptRef.current = () => preemptDictation(session);
  });
};
