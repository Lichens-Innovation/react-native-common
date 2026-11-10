import type { Dispatch, RefObject, SetStateAction } from 'react';

export interface RecordingTextInputArgs {
  value: string;
  recordingUri?: string;
}

/** habit-hooks-disable non-essential-comment
 * Where a dictation session is.
 *
 * - `idle` — nothing running.
 * - `recording` — capturing, either engine.
 * - `awaitingAudioEnd` — system engine only: stopped, waiting for `audioend` to hand over the file
 *   it persisted. The text is already committed, so the field stays usable.
 * - `transcribing` — on-device engine only: stopped, the model is working. Seconds, not instant.
 * - `fileFallback` — an on-device attempt produced nothing, so its audio is being replayed through
 *   the system recogniser rather than thrown away.
 *
 * One value rather than several booleans: the failure paths cross each other (stop during
 * transcription, clear during fallback, unmount mid-capture) and independent flags let those
 * combinations strand the field in a state with no way back.
 */
export type DictationPhase = 'idle' | 'recording' | 'awaitingAudioEnd' | 'transcribing' | 'fileFallback';

export type MicPosition = 'right' | 'below';

export interface DictationRefs {
  lastFinalValue: RefObject<string>;
  wantsAudioEnd: RefObject<boolean>;
  preempt: RefObject<() => void>;
  isOnDevice: RefObject<boolean>;
  pendingAudioUri: RefObject<string | null>;
  timeout: RefObject<ReturnType<typeof setTimeout> | null>;
  /** Mirrors `phase` for the callbacks the coordinator and the unmount cleanup invoke, which run habit-hooks-disable non-essential-comment
   * outside render and would otherwise read a stale value.
   */
  phase: RefObject<DictationPhase>;
  /** habit-hooks-disable non-essential-comment
   * Invalidates in-flight work. Any async continuation captures the token it started with and does
   * nothing if it no longer matches, which is what stops a late transcription from writing into a
   * field the user has since cleared or handed to another engine.
   */
  sessionToken: RefObject<number>;
}

export interface DictationState {
  phase: DictationPhase;
  setPhase: Dispatch<SetStateAction<DictationPhase>>;
  recordingValue: string;
  setRecordingValue: Dispatch<SetStateAction<string>>;
  recordingUri: string | null;
  setRecordingUri: Dispatch<SetStateAction<string | null>>;
}

export interface DictationSessionContext extends DictationState {
  refs: DictationRefs;
  ownerId: string;
  query: string;
  languageCode: string;
  persistRecording: boolean;
  onValueChange: (args: RecordingTextInputArgs) => void;
}
