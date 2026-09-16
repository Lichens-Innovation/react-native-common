/**
 * Optional on-device transcription for VoiceRecognitionTextInput.
 *
 * The implementation is *injected* rather than imported. This package is consumed by several apps,
 * and only some of them ship the native modules an on-device engine needs; a direct import -- even
 * a dynamic one, since Metro bundles those too -- would force every consumer to install them. With
 * injection, an app that never calls `setOnDeviceSpeechEngine` behaves exactly as before.
 *
 * Every method is allowed to fail. The text input treats any failure, at any stage, as a reason to
 * fall back to expo-speech-recognition without telling the user: dictation must always produce
 * something, and which engine produced it is not the user's problem.
 */

export interface OnDeviceTranscription {
  text: string;
  /** Local URI of the captured audio, when the engine kept it. */
  audioUri?: string;
}

export interface OnDeviceSpeechEngine {
  /**
   * Whether the engine can be used right now -- model present, nothing missing. Called on every
   * microphone press, so it must be cheap and must not throw.
   */
  isReady(): boolean;

  /**
   * Begins capturing audio. Should return promptly: any expensive preparation (loading a model)
   * belongs in the background while the user is already speaking.
   *
   * @param onAutoStop Invoked if the engine stops capture on its own, e.g. on hitting a duration
   *   cap. Capture has already stopped by then; the caller still has to finish the session.
   * @returns false when capture could not start, e.g. the microphone permission was refused.
   */
  startCapture(onAutoStop?: () => void): Promise<boolean>;

  /**
   * Stops capturing and transcribes what was captured.
   *
   * @param options.keepAudio Whether the caller wants the audio afterwards. When false the engine
   *   may discard it once transcription succeeds -- but it must still keep it when transcription
   *   fails, so the caller can fall back to recognising the file.
   * @returns null when transcription failed for any reason. The captured audio should still be
   *   available from `getLastAudioUri`.
   */
  stopAndTranscribe(options?: { keepAudio?: boolean }): Promise<OnDeviceTranscription | null>;

  /** Stops capturing and throws the audio away, for when another field takes over the microphone. */
  abortCapture(): void;

  /**
   * The audio captured by the last session, kept even when transcription failed, so a failed
   * on-device attempt can be re-run through the system recogniser instead of being lost.
   */
  getLastAudioUri(): string | null;

  /**
   * Tells the engine the caller is finished with the last capture's audio, so it can be deleted.
   * Called after a session that did not want the recording kept.
   */
  releaseLastAudio(): void;
}

let engine: OnDeviceSpeechEngine | null = null;

/** Registers the engine. Call once during app start-up; pass null to go back to system-only. */
export const setOnDeviceSpeechEngine = (next: OnDeviceSpeechEngine | null): void => {
  engine = next;
};

export const getOnDeviceSpeechEngine = (): OnDeviceSpeechEngine | null => engine;
