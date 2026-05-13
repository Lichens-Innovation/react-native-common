import { ExpoSpeechRecognitionModule } from 'expo-speech-recognition';

type Owner = {
  id: string;
  preempt: () => void;
};

let currentOwner: Owner | null = null;

const POLL_INTERVAL_MS = 50;
const POLL_MAX_ATTEMPTS = 20;

const waitForInactive = async (): Promise<void> => {
  for (let i = 0; i < POLL_MAX_ATTEMPTS; i++) {
    const state = await ExpoSpeechRecognitionModule.getStateAsync();
    if (state === 'inactive') return;
    await new Promise((r) => setTimeout(r, POLL_INTERVAL_MS));
  }
};

export const requestStart = async (owner: Owner, startSession: () => void): Promise<void> => {
  if (currentOwner && currentOwner.id !== owner.id) {
    const prev = currentOwner;
    currentOwner = null;
    prev.preempt();
    ExpoSpeechRecognitionModule.abort();
    await waitForInactive();
  }
  currentOwner = owner;
  startSession();
};

export const clearOwner = (id: string): void => {
  if (currentOwner?.id === id) currentOwner = null;
};
