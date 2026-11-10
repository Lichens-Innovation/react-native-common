import { isNotBlank } from '@lichens-innovation/ts-common';
import { useSpeechRecognitionEvent } from 'expo-speech-recognition';
import { FunctionComponent } from 'react';
import { logger } from '../../../logger/logger';
import { endSession } from './dictation-session';
import type { DictationSessionContext } from './dictation-session.types';
import { finishFileFallback } from './dictation-on-device-engine';
import { handleSystemAudioEnd } from './dictation-system-engine';

/** habit-hooks-disable non-essential-comment
 * Recognition errors caused by the user's surroundings, not by the app: no connection to the online
 * recognizer, or nothing said before it gave up. Logged as warnings so they stop reaching Sentry
 * (LICHENS-DISPATCH-MOBILE-77); anything else still does.
 */
const EXPECTED_RECOGNITION_ERRORS: ReadonlySet<string> = new Set(['network', 'no-speech', 'speech-timeout']);

interface SpeechRecognitionListenerProps {
  session: DictationSessionContext;
  isSystemEngine: boolean;
}

/* habit-hooks-disable non-essential-comment
 * Mounted only while a session is active so the native listeners don't sit attached on every text
 * field in big forms (perf/memory).
 */
export const SpeechRecognitionListener: FunctionComponent<SpeechRecognitionListenerProps> = ({
  session,
  isSystemEngine,
}) => {
  const { phase } = session;
  const { wantsAudioEnd: wantsAudioEndRef } = session.refs;

  useSpeechRecognitionEvent('result', (event) => {
    const isLiveSystemDictation = phase === 'recording' && isSystemEngine;
    // A fallback session is not "recording", but its results are the entire point of it. habit-hooks-disable non-essential-comment
    if (!isLiveSystemDictation && phase !== 'fileFallback') return;

    const transcript = event.results?.[0]?.transcript ?? '';
    if (isNotBlank(transcript)) {
      session.setRecordingValue(transcript);
    }
  });

  useSpeechRecognitionEvent('error', (event) => {
    const { error, message } = event;
    if (error !== 'aborted') {
      const log = EXPECTED_RECOGNITION_ERRORS.has(error) ? logger.warn : logger.error;
      log.call(logger, `[useSpeechRecognitionEvent] error: ${error} - ${message}`);
    }
    wantsAudioEndRef.current = false;
    if (phase === 'fileFallback') finishFileFallback(session);
    else endSession(session);
  });

  useSpeechRecognitionEvent('audioend', (event) => {
    /* habit-hooks-disable non-essential-comment
     * A fallback session ends on `end`, not here. Android emits `audioend` and `end` as separate
     * events, so tearing down on `audioend` would unmount this listener before `end` arrived and
     * the fallback would never finish.
     */
    if (phase === 'fileFallback') return;

    if (!wantsAudioEndRef.current) {
      handleSystemAudioEnd(session, null);
      return;
    }
    wantsAudioEndRef.current = false;
    handleSystemAudioEnd(session, event.uri ?? null);
  });

  useSpeechRecognitionEvent('end', () => {
    if (phase === 'fileFallback') finishFileFallback(session);
  });

  return null;
};
