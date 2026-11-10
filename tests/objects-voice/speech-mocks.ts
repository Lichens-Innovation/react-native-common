import { act } from '@testing-library/react-native';
import type { OnDeviceSpeechEngine } from '@lib';

type SpeechEventName = 'result' | 'error' | 'audioend' | 'end';
type Handler = (event: object) => void;

const handlers = new Map<string, Handler>();

export const speechModule = {
  getPermissionsAsync: jest.fn(),
  requestPermissionsAsync: jest.fn(),
  start: jest.fn(),
  stop: jest.fn(),
  abort: jest.fn(),
  supportsRecording: jest.fn(),
  getStateAsync: jest.fn(),
};

export const expoSpeechRecognitionMock = {
  __esModule: true,
  ExpoSpeechRecognitionModule: speechModule,
  useSpeechRecognitionEvent: (name: string, handler: Handler) => {
    handlers.set(name, handler);
  },
};

export const hasSpeechListener = (name: string) => handlers.has(name);

export const emitSpeechEvent = async (name: SpeechEventName, event: object = {}) => {
  const handler = handlers.get(name);
  if (!handler) throw new Error(`no "${name}" speech listener mounted`);
  await act(async () => handler(event));
};

export const resetSpeechMocks = () => {
  handlers.clear();
  Object.values(speechModule).forEach((fn) => fn.mockReset());
  speechModule.getPermissionsAsync.mockResolvedValue({ granted: true });
  speechModule.requestPermissionsAsync.mockResolvedValue({ granted: true });
  speechModule.supportsRecording.mockReturnValue(true);
  speechModule.getStateAsync.mockResolvedValue('inactive');
};

export const createEngine = (overrides: Partial<jest.Mocked<OnDeviceSpeechEngine>> = {}) => {
  const engine: jest.Mocked<OnDeviceSpeechEngine> = {
    isReady: jest.fn(() => true),
    startCapture: jest.fn(async () => true),
    stopAndTranscribe: jest.fn(async () => ({ text: 'on device text', audioUri: 'file:///capture.wav' })),
    abortCapture: jest.fn(),
    getLastAudioUri: jest.fn(() => 'file:///capture.wav'),
    releaseLastAudio: jest.fn(),
    ...overrides,
  };
  return engine;
};
