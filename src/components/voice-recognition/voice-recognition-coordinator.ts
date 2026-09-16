import { ExpoSpeechRecognitionModule } from 'expo-speech-recognition';

type Owner = {
  id: string;
  preempt: () => void;
  /**
   * Stops whatever the owner started. Defaults to aborting expo-speech-recognition, which is what
   * every owner used before on-device transcription existed; an owner capturing audio some other
   * way passes its own teardown here.
   */
  abort?: () => void;
};

let currentOwner: Owner | null = null;

/**
 * Subscribers to "who holds the microphone". There is one recorder and one model, so a second field
 * starting while the first is still going corrupts both; the text inputs use this to disable their
 * own microphone whenever another field owns the session.
 */
const ownerListeners = new Set<() => void>();

const setCurrentOwner = (owner: Owner | null) => {
  if (currentOwner?.id === owner?.id) return;
  currentOwner = owner;
  ownerListeners.forEach((listener) => listener());
};

export const subscribeToDictationOwner = (listener: () => void): (() => void) => {
  ownerListeners.add(listener);
  return () => {
    ownerListeners.delete(listener);
  };
};

/** The id of the field currently holding the microphone, or null when nothing is running. */
export const getDictationOwnerId = (): string | null => currentOwner?.id ?? null;

const POLL_INTERVAL_MS = 50;
const POLL_MAX_ATTEMPTS = 20;

const waitForInactive = async (): Promise<void> => {
  for (let i = 0; i < POLL_MAX_ATTEMPTS; i++) {
    const state = await ExpoSpeechRecognitionModule.getStateAsync();
    if (state === 'inactive') return;
    await new Promise((r) => setTimeout(r, POLL_INTERVAL_MS));
  }
};

const abortExpo = () => {
  ExpoSpeechRecognitionModule.abort();
};

export const requestStart = async (owner: Owner, startSession: () => void): Promise<void> => {
  if (currentOwner && currentOwner.id !== owner.id) {
    const prev = currentOwner;
    setCurrentOwner(null);
    prev.preempt();
    (prev.abort ?? abortExpo)();
    await waitForInactive();
  }
  setCurrentOwner(owner);
  startSession();
};

export const clearOwner = (id: string): void => {
  if (currentOwner?.id === id) setCurrentOwner(null);
};
