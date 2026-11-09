import { ExpoSpeechRecognitionModule } from 'expo-speech-recognition';
import {
  buildFinalValue,
  ensureVoiceRecognitionPermissions,
  getOnDeviceSpeechEngine,
  logger,
  setOnDeviceSpeechEngine,
} from '@lib';
import { createEngine, resetSpeechMocks, speechModule } from './speech-mocks';

jest.mock(
  'expo-speech-recognition',
  () => jest.requireActual<typeof import('./speech-mocks')>('./speech-mocks').expoSpeechRecognitionMock
);

beforeEach(() => {
  resetSpeechMocks();
});

afterEach(() => {
  jest.restoreAllMocks();
});

describe('buildFinalValue', () => {
  it.each`
    query        | recordingValue | expected
    ${''}        | ${''}          | ${''}
    ${'hello'}   | ${''}          | ${'hello'}
    ${''}        | ${'world'}     | ${'world'}
    ${'hello'}   | ${'world'}     | ${'hello world'}
    ${'   '}     | ${'world'}     | ${'world'}
    ${'hello'}   | ${'  '}        | ${'hello'}
    ${' hello '} | ${' world '}   | ${' hello   world '}
  `('joins "$query" + "$recordingValue" -> "$expected"', ({ query, recordingValue, expected }) => {
    expect(buildFinalValue({ query, recordingValue })).toBe(expected);
  });
});

describe('ensureVoiceRecognitionPermissions', () => {
  it('returns true without requesting when already granted', async () => {
    // act
    const result = await ensureVoiceRecognitionPermissions();

    // assert
    expect(result).toBe(true);
    expect(speechModule.requestPermissionsAsync).not.toHaveBeenCalled();
  });

  it('requests and returns true when the user grants', async () => {
    // arrange
    speechModule.getPermissionsAsync.mockResolvedValue({ granted: false });
    speechModule.requestPermissionsAsync.mockResolvedValue({ granted: true });

    // act
    const result = await ensureVoiceRecognitionPermissions();

    // assert
    expect(result).toBe(true);
    expect(speechModule.requestPermissionsAsync).toHaveBeenCalledTimes(1);
  });

  it('logs at info level and returns false when the user refuses', async () => {
    // arrange
    const infoSpy = jest.spyOn(logger, 'info');
    const refused = { granted: false, canAskAgain: false };
    speechModule.getPermissionsAsync.mockResolvedValue({ granted: false });
    speechModule.requestPermissionsAsync.mockResolvedValue(refused);

    // act
    const result = await ensureVoiceRecognitionPermissions();

    // assert
    expect(result).toBe(false);
    expect(infoSpy).toHaveBeenCalledWith('[ensureVoiceRecognitionPermissions] Permissions not granted', refused);
  });

  it.each`
    failing
    ${'getPermissionsAsync'}
    ${'requestPermissionsAsync'}
  `('logs an error and returns false when $failing rejects', async ({ failing }) => {
    // arrange
    const errorSpy = jest.spyOn(logger, 'error');
    const error = new Error('native');
    speechModule.getPermissionsAsync.mockResolvedValue({ granted: false });
    jest.mocked(ExpoSpeechRecognitionModule[failing as 'getPermissionsAsync']).mockRejectedValue(error);

    // act
    const result = await ensureVoiceRecognitionPermissions();

    // assert
    expect(result).toBe(false);
    expect(errorSpy).toHaveBeenCalledWith('[ensureVoiceRecognitionPermissions] Error getting permissions', error);
  });

  it('logs an error and returns false when the request resolves to nothing', async () => {
    // arrange
    const errorSpy = jest.spyOn(logger, 'error');
    speechModule.getPermissionsAsync.mockResolvedValue({ granted: false });
    speechModule.requestPermissionsAsync.mockResolvedValue(undefined);

    // act
    const result = await ensureVoiceRecognitionPermissions();

    // assert
    expect(result).toBe(false);
    expect(errorSpy).toHaveBeenCalledTimes(1);
  });
});

describe('setOnDeviceSpeechEngine / getOnDeviceSpeechEngine', () => {
  afterEach(() => setOnDeviceSpeechEngine(null));

  it('returns null when no engine was registered', () => {
    expect(getOnDeviceSpeechEngine()).toBeNull();
  });

  it('returns the registered engine and goes back to null when reset', () => {
    // arrange
    const engine = createEngine();

    // act
    setOnDeviceSpeechEngine(engine);

    // assert
    expect(getOnDeviceSpeechEngine()).toBe(engine);

    // act
    setOnDeviceSpeechEngine(null);

    // assert
    expect(getOnDeviceSpeechEngine()).toBeNull();
  });
});
