import { useSyncExternalStore } from 'react';
import { getDictationOwnerId, subscribeToDictationOwner } from '../voice-recognition-coordinator';

/** habit-hooks-disable non-essential-comment
 * Another field is dictating. There is one microphone and one model behind all of these inputs,
 * and starting a second session while the first is mid-flight corrupted both -- the capture that
 * was already opening would be left running with nothing tracking it, and on-device transcription
 * stayed broken for the rest of the process. Locking the other microphones makes that
 * unreachable rather than merely recoverable.
 */
export const useDictationLock = (ownerId: string): boolean => {
  const dictationOwnerId = useSyncExternalStore(subscribeToDictationOwner, getDictationOwnerId, getDictationOwnerId);
  return dictationOwnerId !== null && dictationOwnerId !== ownerId;
};
