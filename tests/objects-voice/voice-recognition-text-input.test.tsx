import { act, fireEvent, screen } from '@testing-library/react-native';
import { Keyboard } from 'react-native';
import { logger, setOnDeviceSpeechEngine, VoiceRecognitionTextInput } from '@lib';
import { resetMediaMocks } from './media-mocks';
import { renderWithProviders } from './render-with-providers';
import { createEngine, emitSpeechEvent, hasSpeechListener, resetSpeechMocks, speechModule } from './speech-mocks';

jest.mock(
  'react-native-paper/lib/commonjs/components/MaterialCommunityIcon',
  () => jest.requireActual<typeof import('./paper-icon-mock')>('./paper-icon-mock').paperIconMock
);
jest.mock(
  'expo-speech-recognition',
  () => jest.requireActual<typeof import('./speech-mocks')>('./speech-mocks').expoSpeechRecognitionMock
);
jest.mock('expo-audio', () => jest.requireActual<typeof import('./media-mocks')>('./media-mocks').expoAudioMock);

type Props = Parameters<typeof VoiceRecognitionTextInput>[0];

interface FormProps {
  showA: boolean;
}

interface Transcription {
  text: string;
  audioUri?: string;
}

const renderInput = async (props: Partial<Props> = {}) => {
  const onValueChange = jest.fn();
  const onEffectiveValueChange = jest.fn();
  const onRecordingStateChange = jest.fn();
  const utils = await renderWithProviders(
    <VoiceRecognitionTextInput
      label="Notes"
      accessibilityLabel={INPUT_LABEL}
      value=""
      editable
      onValueChange={onValueChange}
      onEffectiveValueChange={onEffectiveValueChange}
      onRecordingStateChange={onRecordingStateChange}
      {...props}
    />
  );
  return { onValueChange, onEffectiveValueChange, onRecordingStateChange, ...utils };
};

const INPUT_LABEL = 'notes-input';
const MIC_BUTTON_NAME = /^icon-(microphone-outline|stop)$/;

const mic = () => screen.getByRole('button', { name: MIC_BUTTON_NAME });
const allMics = () => screen.getAllByRole('button', { name: MIC_BUTTON_NAME });
const clearButton = () => screen.getByRole('button', { name: 'close' });
const input = () => screen.getByLabelText(INPUT_LABEL);
// eslint-disable-next-line coding-guide/prefer-role-query-over-testid -- the src ActivityIndicator has no role nor label
const busyIndicator = () => screen.queryByTestId('dictation-busy');

const pressMic = async () => {
  await fireEvent.press(mic());
  // permission check + coordinator are async habit-hooks-disable non-essential-comment
  await act(async () => {});
};

const lastCall = (fn: jest.Mock) => fn.mock.calls.at(-1)?.[0];

beforeEach(() => {
  resetSpeechMocks();
  resetMediaMocks();
  setOnDeviceSpeechEngine(null);
});

afterEach(() => {
  jest.useRealTimers();
  jest.restoreAllMocks();
  setOnDeviceSpeechEngine(null);
});

describe('VoiceRecognitionTextInput', () => {
  describe('idle', () => {
    it('shows the value and the label, with the microphone icon', async () => {
      // act
      await renderInput({ value: 'hello' });

      // assert
      expect(input()).toHaveDisplayValue('hello');
      expect(screen.getAllByText('Notes').length).toBeGreaterThan(0);
      expect(screen.getByLabelText('icon-microphone-outline')).toBeOnTheScreen();
      expect(busyIndicator()).toBeNull();
    });

    it('reports typed text through onValueChange without a recording uri', async () => {
      // arrange
      const { onValueChange } = await renderInput({ value: 'a' });

      // act
      await fireEvent.changeText(input(), 'abc');

      // assert
      expect(onValueChange).toHaveBeenCalledWith({ value: 'abc' });
    });

    it('reports the effective value on mount', async () => {
      // act
      const { onEffectiveValueChange } = await renderInput({ value: 'hello' });

      // assert
      expect(onEffectiveValueChange).toHaveBeenCalledWith({ value: 'hello', recordingUri: undefined });
    });

    it('reports not dictating on mount', async () => {
      // act
      const { onRecordingStateChange } = await renderInput();

      // assert
      expect(onRecordingStateChange).toHaveBeenCalledWith(false);
    });

    it.each`
      editable
      ${undefined}
      ${false}
    `('disables the microphone and the clear button when editable=$editable', async ({ editable }) => {
      // act
      await renderInput({ value: 'hello', editable });

      // assert
      expect(mic()).toBeDisabled();
      expect(clearButton()).toBeDisabled();
    });

    it.each`
      value
      ${''}
      ${'   '}
      ${undefined}
    `('disables the clear button for a blank value ($value)', async ({ value }) => {
      // act
      await renderInput({ value });

      // assert
      expect(clearButton()).toBeDisabled();
      expect(mic()).toBeEnabled();
    });

    it('clears the value through onValueChange', async () => {
      // arrange
      const { onValueChange } = await renderInput({ value: 'hello' });

      // act
      await fireEvent.press(clearButton());

      // assert
      expect(onValueChange).toHaveBeenCalledWith({ value: '' });
      expect(speechModule.abort).not.toHaveBeenCalled();
    });

    it('hides the clear button when showClear is false', async () => {
      // act
      await renderInput({ value: 'hello', showClear: false });

      // assert
      expect(screen.queryByRole('button', { name: 'close' })).toBeNull();
    });

    it.each`
      showPlayback | recordingUri          | hasReplay
      ${false}     | ${'file:///prev.wav'} | ${false}
      ${true}      | ${'file:///prev.wav'} | ${true}
      ${true}      | ${undefined}          | ${false}
      ${true}      | ${null}               | ${false}
    `(
      'replay button shown=$hasReplay for showPlayback=$showPlayback recordingUri=$recordingUri',
      async ({ showPlayback, recordingUri, hasReplay }) => {
        // act
        await renderInput({ showPlayback, recordingUri });

        // assert
        expect(screen.queryByRole('button', { name: 'replayRecording' }) !== null).toBe(hasReplay);
      }
    );

    it('reports a recordingUri prop as the effective recording uri', async () => {
      // act
      const { onEffectiveValueChange } = await renderInput({ value: 'x', recordingUri: 'file:///prev.wav' });

      // assert
      expect(onEffectiveValueChange).toHaveBeenCalledWith({ value: 'x', recordingUri: 'file:///prev.wav' });
    });

    it('forwards a long press on the microphone', async () => {
      // arrange
      const onMicLongPress = jest.fn();
      await renderInput({ onMicLongPress });

      // act
      await fireEvent(mic(), 'longPress');

      // assert
      expect(onMicLongPress).toHaveBeenCalledTimes(1);
    });

    it.each`
      micPosition
      ${'right'}
      ${'below'}
    `('renders the microphone with micPosition=$micPosition', async ({ micPosition }) => {
      // act
      await renderInput({ micPosition });

      // assert
      expect(mic()).toBeOnTheScreen();
    });
  });

  describe('permissions', () => {
    it('does not start when the permission is refused', async () => {
      // arrange
      speechModule.getPermissionsAsync.mockResolvedValue({ granted: false });
      speechModule.requestPermissionsAsync.mockResolvedValue({ granted: false });
      const { onRecordingStateChange } = await renderInput();

      // act
      await pressMic();

      // assert
      expect(speechModule.start).not.toHaveBeenCalled();
      expect(screen.getByLabelText('icon-microphone-outline')).toBeOnTheScreen();
      expect(onRecordingStateChange).not.toHaveBeenCalledWith(true);
    });

    it('requests the permission then starts when granted', async () => {
      // arrange
      speechModule.getPermissionsAsync.mockResolvedValue({ granted: false });
      speechModule.requestPermissionsAsync.mockResolvedValue({ granted: true });
      await renderInput();

      // act
      await pressMic();

      // assert
      expect(speechModule.start).toHaveBeenCalledTimes(1);
    });
  });

  describe('system engine', () => {
    it.each`
      persistRecording | supportsRecording | recordingOptions
      ${undefined}     | ${true}           | ${{ persist: true }}
      ${true}          | ${false}          | ${undefined}
      ${false}         | ${true}           | ${undefined}
    `(
      'starts expo recognition (persistRecording=$persistRecording, supportsRecording=$supportsRecording)',
      async ({ persistRecording, supportsRecording, recordingOptions }) => {
        // arrange
        speechModule.supportsRecording.mockReturnValue(supportsRecording);
        const dismissSpy = jest.spyOn(Keyboard, 'dismiss');
        const { onRecordingStateChange } = await renderInput({ persistRecording });

        // act
        await pressMic();

        // assert
        const options = speechModule.start.mock.calls[0][0];
        expect(options).toEqual({
          lang: 'speechToTextLanguageCode',
          interimResults: true,
          continuous: true,
          ...(recordingOptions && { recordingOptions }),
        });
        expect(dismissSpy).toHaveBeenCalled();
        expect(screen.getByLabelText('icon-stop')).toBeOnTheScreen();
        expect(onRecordingStateChange).toHaveBeenLastCalledWith(true);
        expect(hasSpeechListener('result')).toBe(true);
      }
    );

    it('shows live transcripts appended to the typed value and ignores blank ones', async () => {
      // arrange
      const { onEffectiveValueChange, onValueChange } = await renderInput({ value: 'before' });
      await pressMic();

      // act
      await emitSpeechEvent('result', { results: [{ transcript: 'spoken words' }] });
      await emitSpeechEvent('result', { results: [{ transcript: '   ' }] });
      await emitSpeechEvent('result', { results: [] });

      // assert
      expect(input()).toHaveDisplayValue('before spoken words');
      expect(lastCall(onEffectiveValueChange)).toEqual({ value: 'before spoken words', recordingUri: undefined });
      expect(onValueChange).not.toHaveBeenCalled();
    });

    it('commits the transcript on stop, then the persisted audio on audioend', async () => {
      // arrange
      const { onValueChange, onRecordingStateChange } = await renderInput({ value: 'before', showPlayback: true });
      await pressMic();
      await emitSpeechEvent('result', { results: [{ transcript: 'spoken' }] });

      // act
      await fireEvent.press(mic());

      // assert
      expect(speechModule.stop).toHaveBeenCalledTimes(1);
      expect(onValueChange).toHaveBeenNthCalledWith(1, { value: 'before spoken' });
      expect(onRecordingStateChange).toHaveBeenLastCalledWith(false);
      expect(screen.getByLabelText('icon-microphone-outline')).toBeOnTheScreen();

      // act
      await emitSpeechEvent('audioend', { uri: 'file:///speech.wav' });

      // assert
      expect(onValueChange).toHaveBeenNthCalledWith(2, { value: 'before spoken', recordingUri: 'file:///speech.wav' });
      expect(screen.getByRole('button', { name: 'replayRecording' })).toBeOnTheScreen();
      expect(hasSpeechListener('result')).toBe(true);
    });

    it('ends without waiting for audioend when the recording is not persisted', async () => {
      // arrange
      const { onValueChange } = await renderInput({ persistRecording: false });
      await pressMic();
      await emitSpeechEvent('result', { results: [{ transcript: 'spoken' }] });

      // act
      await fireEvent.press(mic());

      // assert
      expect(onValueChange).toHaveBeenCalledTimes(1);
      expect(onValueChange).toHaveBeenCalledWith({ value: 'spoken' });
    });

    it('does not commit anything when stopping with a blank transcript', async () => {
      // arrange
      const { onValueChange } = await renderInput({ value: 'typed', persistRecording: false });
      await pressMic();

      // act
      await fireEvent.press(mic());

      // assert
      expect(onValueChange).not.toHaveBeenCalled();
      expect(input()).toHaveDisplayValue('typed');
    });

    it('audioend without uri releases the session without a second commit', async () => {
      // arrange
      const { onValueChange } = await renderInput();
      await pressMic();
      await emitSpeechEvent('result', { results: [{ transcript: 'spoken' }] });
      await fireEvent.press(mic());

      // act
      await emitSpeechEvent('audioend', {});

      // assert
      expect(onValueChange).toHaveBeenCalledTimes(1);
    });

    it('releases the session with a warning when audioend never arrives (10 s)', async () => {
      // arrange
      jest.useFakeTimers();
      const warnSpy = jest.spyOn(logger, 'warn');
      const { onValueChange } = await renderInput();
      await pressMic();
      await fireEvent.press(mic());

      // act
      await act(async () => {
        jest.advanceTimersByTime(10_000);
      });

      // assert
      expect(warnSpy).toHaveBeenCalledWith('[VoiceRecognitionTextInput] audioend never arrived; releasing the session');
      expect(onValueChange).not.toHaveBeenCalled();
    });

    it('logs a warning when stop() throws and still commits', async () => {
      // arrange
      const warnSpy = jest.spyOn(logger, 'warn');
      speechModule.stop.mockImplementation(() => {
        throw new Error('stop failed');
      });
      const { onValueChange } = await renderInput({ persistRecording: false });
      await pressMic();
      await emitSpeechEvent('result', { results: [{ transcript: 'spoken' }] });

      // act
      await fireEvent.press(mic());

      // assert
      expect(warnSpy).toHaveBeenCalledWith('Speech recognition stop() failed:', expect.any(Error));
      expect(onValueChange).toHaveBeenCalledWith({ value: 'spoken' });
      expect(screen.getByLabelText('icon-microphone-outline')).toBeOnTheScreen();
    });

    it.each`
      error               | level
      ${'network'}        | ${'warn'}
      ${'no-speech'}      | ${'warn'}
      ${'speech-timeout'} | ${'warn'}
      ${'audio-capture'}  | ${'error'}
    `('logs a "$error" recognition error at $level level and ends the session', async ({ error, level }) => {
      // arrange
      const spy = jest.spyOn(logger, level as 'warn' | 'error');
      const { onValueChange, onRecordingStateChange } = await renderInput();
      await pressMic();
      await emitSpeechEvent('result', { results: [{ transcript: 'lost words' }] });

      // act
      await emitSpeechEvent('error', { error, message: 'msg' });

      // assert
      expect(spy).toHaveBeenCalledWith(`[useSpeechRecognitionEvent] error: ${error} - msg`);
      expect(screen.getByLabelText('icon-microphone-outline')).toBeOnTheScreen();
      expect(onRecordingStateChange).toHaveBeenLastCalledWith(false);
      expect(onValueChange).not.toHaveBeenCalled();
      expect(input()).toHaveDisplayValue('');
    });

    it('does not log an "aborted" error', async () => {
      // arrange
      const warnSpy = jest.spyOn(logger, 'warn');
      const errorSpy = jest.spyOn(logger, 'error');
      await renderInput();
      await pressMic();

      // act
      await emitSpeechEvent('error', { error: 'aborted', message: '' });

      // assert
      expect(warnSpy).not.toHaveBeenCalled();
      expect(errorSpy).not.toHaveBeenCalled();
      expect(screen.getByLabelText('icon-microphone-outline')).toBeOnTheScreen();
    });

    it('clear while recording aborts recognition and drops the transcript', async () => {
      // arrange
      const { onValueChange } = await renderInput({ value: 'typed' });
      await pressMic();
      await emitSpeechEvent('result', { results: [{ transcript: 'spoken' }] });

      // act
      await fireEvent.press(clearButton());

      // assert
      expect(speechModule.abort).toHaveBeenCalledTimes(1);
      expect(onValueChange).toHaveBeenCalledTimes(1);
      expect(onValueChange).toHaveBeenCalledWith({ value: '' });
      expect(screen.getByLabelText('icon-microphone-outline')).toBeOnTheScreen();
    });

    it('stops recognition when unmounted mid-recording', async () => {
      // arrange
      const { unmount } = await renderInput();
      await pressMic();

      // act
      await unmount();

      // assert
      expect(speechModule.stop).toHaveBeenCalledTimes(1);
    });

    it('does not stop recognition when unmounted idle', async () => {
      // arrange
      const { unmount } = await renderInput();

      // act
      await unmount();

      // assert
      expect(speechModule.stop).not.toHaveBeenCalled();
    });
  });

  describe('dictation lock across fields', () => {
    it('disables the other fields microphones while one field dictates, and releases them after', async () => {
      // arrange
      await renderWithProviders(
        <>
          <VoiceRecognitionTextInput label="A" value="" editable onValueChange={jest.fn()} persistRecording={false} />
          <VoiceRecognitionTextInput label="B" value="" editable onValueChange={jest.fn()} persistRecording={false} />
        </>
      );
      // act
      await fireEvent.press(allMics()[0]);
      await act(async () => {});

      // assert
      expect(allMics()[0]).toBeEnabled();
      expect(allMics()[1]).toBeDisabled();

      // act
      await fireEvent.press(allMics()[0]);

      // assert
      expect(allMics()[1]).toBeEnabled();
    });

    it('releases the lock when the dictating field unmounts', async () => {
      // arrange
      const Form = ({ showA }: FormProps) => (
        <>
          {showA && <VoiceRecognitionTextInput label="A" value="" editable onValueChange={jest.fn()} />}
          <VoiceRecognitionTextInput label="B" value="" editable onValueChange={jest.fn()} />
        </>
      );
      const { rerender } = await renderWithProviders(<Form showA />);
      await fireEvent.press(allMics()[0]);
      await act(async () => {});
      expect(allMics()[1]).toBeDisabled();

      // act
      await rerender(<Form showA={false} />);

      // assert
      expect(mic()).toBeEnabled();
    });
  });

  describe('on-device engine', () => {
    it('captures with the engine instead of expo recognition', async () => {
      // arrange
      const engine = createEngine();
      setOnDeviceSpeechEngine(engine);
      const dismissSpy = jest.spyOn(Keyboard, 'dismiss');
      const { onRecordingStateChange } = await renderInput();

      // act
      await pressMic();

      // assert
      expect(engine.startCapture).toHaveBeenCalledWith(expect.any(Function));
      expect(speechModule.start).not.toHaveBeenCalled();
      expect(screen.getByLabelText('icon-stop')).toBeOnTheScreen();
      expect(dismissSpy).toHaveBeenCalled();
      expect(onRecordingStateChange).toHaveBeenLastCalledWith(true);
    });

    it.each`
      persistRecording | keepAudio | committed
      ${undefined}     | ${true}   | ${{ value: 'typed on device text', recordingUri: 'file:///capture.wav' }}
      ${false}         | ${false}  | ${{ value: 'typed on device text' }}
    `(
      'transcribes on stop and commits (persistRecording=$persistRecording)',
      async ({ persistRecording, keepAudio, committed }) => {
        // arrange
        const engine = createEngine();
        setOnDeviceSpeechEngine(engine);
        const { onValueChange, onRecordingStateChange } = await renderInput({ value: 'typed', persistRecording });
        await pressMic();

        // act
        await fireEvent.press(mic());
        await act(async () => {});

        // assert
        expect(engine.stopAndTranscribe).toHaveBeenCalledWith({ keepAudio });
        expect(onValueChange).toHaveBeenCalledTimes(1);
        expect(onValueChange).toHaveBeenCalledWith(committed);
        expect(onRecordingStateChange).toHaveBeenLastCalledWith(false);
        expect(screen.getByLabelText('icon-microphone-outline')).toBeOnTheScreen();
      }
    );

    it('shows a busy indicator and stays "dictating" while transcribing', async () => {
      // arrange
      let finish!: (value: Transcription) => void;
      const engine = createEngine({
        stopAndTranscribe: jest.fn(() => new Promise<Transcription>((resolve) => (finish = resolve))),
      });
      setOnDeviceSpeechEngine(engine);
      const { onRecordingStateChange, onValueChange } = await renderInput();
      await pressMic();

      // act
      await fireEvent.press(mic());

      // assert
      expect(busyIndicator()).toBeOnTheScreen();
      expect(screen.queryByRole('button', { name: MIC_BUTTON_NAME })).toBeNull();
      expect(onRecordingStateChange).toHaveBeenLastCalledWith(true);

      // act
      await act(async () => finish({ text: 'done' }));

      // assert
      expect(onValueChange).toHaveBeenCalledWith({ value: 'done' });
      expect(mic()).toBeOnTheScreen();
    });

    it('falls back to recognising the captured file when on-device transcription is empty', async () => {
      // arrange
      const engine = createEngine({ stopAndTranscribe: jest.fn(async () => null) });
      setOnDeviceSpeechEngine(engine);
      const { onValueChange, onRecordingStateChange } = await renderInput({ value: 'typed' });
      await pressMic();

      // act
      await fireEvent.press(mic());
      await act(async () => {});

      // assert
      expect(speechModule.start).toHaveBeenCalledWith({
        lang: 'speechToTextLanguageCode',
        interimResults: false,
        continuous: true,
        audioSource: { uri: 'file:///capture.wav' },
      });
      expect(busyIndicator()).toBeOnTheScreen();
      expect(onRecordingStateChange).toHaveBeenLastCalledWith(true);

      // act
      await emitSpeechEvent('result', { results: [{ transcript: 'from file' }] });
      await emitSpeechEvent('audioend', {});

      // assert: audioend does not end a fallback session
      expect(onValueChange).not.toHaveBeenCalled();

      // act
      await emitSpeechEvent('end');

      // assert
      expect(onValueChange).toHaveBeenCalledWith({ value: 'typed from file', recordingUri: 'file:///capture.wav' });
      expect(engine.releaseLastAudio).not.toHaveBeenCalled();
      expect(mic()).toBeOnTheScreen();
    });

    it('uses the transcription audioUri over getLastAudioUri for the fallback', async () => {
      // arrange
      const engine = createEngine({
        stopAndTranscribe: jest.fn(async () => ({ text: '  ', audioUri: 'file:///returned.wav' })),
      });
      setOnDeviceSpeechEngine(engine);
      await renderInput();
      await pressMic();

      // act
      await fireEvent.press(mic());
      await act(async () => {});

      // assert
      expect(speechModule.start.mock.calls[0][0].audioSource).toEqual({ uri: 'file:///returned.wav' });
    });

    it('releases the audio after a fallback when the recording is not persisted', async () => {
      // arrange
      const engine = createEngine({ stopAndTranscribe: jest.fn(async () => null) });
      setOnDeviceSpeechEngine(engine);
      const { onValueChange } = await renderInput({ persistRecording: false });
      await pressMic();
      await fireEvent.press(mic());
      await act(async () => {});
      await emitSpeechEvent('result', { results: [{ transcript: 'from file' }] });

      // act
      await emitSpeechEvent('end');

      // assert
      expect(onValueChange).toHaveBeenCalledWith({ value: 'from file' });
      expect(engine.releaseLastAudio).toHaveBeenCalledTimes(1);
    });

    it('finishes a fallback on a recognition error, committing what was recognised', async () => {
      // arrange
      const engine = createEngine({ stopAndTranscribe: jest.fn(async () => null) });
      setOnDeviceSpeechEngine(engine);
      const { onValueChange } = await renderInput();
      await pressMic();
      await fireEvent.press(mic());
      await act(async () => {});
      await emitSpeechEvent('result', { results: [{ transcript: 'partial' }] });

      // act
      await emitSpeechEvent('error', { error: 'no-speech', message: '' });

      // assert
      expect(onValueChange).toHaveBeenCalledWith({ value: 'partial', recordingUri: 'file:///capture.wav' });
      expect(mic()).toBeOnTheScreen();
    });

    it('gives up a fallback after 30 s with a warning', async () => {
      // arrange
      jest.useFakeTimers();
      const warnSpy = jest.spyOn(logger, 'warn');
      const engine = createEngine({ stopAndTranscribe: jest.fn(async () => null) });
      setOnDeviceSpeechEngine(engine);
      const { onValueChange } = await renderInput();
      await pressMic();
      await fireEvent.press(mic());
      await act(async () => {});

      // act
      await act(async () => {
        jest.advanceTimersByTime(30_000);
      });

      // assert
      expect(warnSpy).toHaveBeenCalledWith('[VoiceRecognitionTextInput] file fallback timed out');
      expect(onValueChange).not.toHaveBeenCalled();
      expect(mic()).toBeOnTheScreen();
    });

    it('ends quietly when transcription fails and no audio survived', async () => {
      // arrange
      const errorSpy = jest.spyOn(logger, 'error');
      const engine = createEngine({
        stopAndTranscribe: jest.fn(async () => {
          throw new Error('model crashed');
        }),
        getLastAudioUri: jest.fn(() => null),
      });
      setOnDeviceSpeechEngine(engine);
      const { onValueChange } = await renderInput();
      await pressMic();

      // act
      await fireEvent.press(mic());
      await act(async () => {});

      // assert
      expect(errorSpy).toHaveBeenCalledWith(
        '[VoiceRecognitionTextInput] on-device transcription failed',
        expect.any(Error)
      );
      expect(speechModule.start).not.toHaveBeenCalled();
      expect(onValueChange).not.toHaveBeenCalled();
      expect(mic()).toBeOnTheScreen();
    });

    it('logs and ends when the file fallback fails to start', async () => {
      // arrange
      const errorSpy = jest.spyOn(logger, 'error');
      speechModule.start.mockImplementation(() => {
        throw new Error('busy');
      });
      const engine = createEngine({ stopAndTranscribe: jest.fn(async () => null) });
      setOnDeviceSpeechEngine(engine);
      await renderInput({ persistRecording: false });
      await pressMic();

      // act
      await fireEvent.press(mic());
      await act(async () => {});

      // assert
      expect(errorSpy).toHaveBeenCalledWith(
        '[VoiceRecognitionTextInput] file fallback failed to start',
        expect.any(Error)
      );
      expect(engine.releaseLastAudio).toHaveBeenCalledTimes(1);
      expect(mic()).toBeOnTheScreen();
    });

    it.each`
      scenario                    | overrides
      ${'isReady() is false'}     | ${{ isReady: jest.fn(() => false) }}
      ${'isReady() throws'} | ${{
        isReady: jest.fn(() => {
          throw new Error('x');
        }),
      }}
      ${'startCapture() refuses'} | ${{ startCapture: jest.fn(async () => false) }}
    `('falls back to expo recognition when $scenario', async ({ overrides }) => {
      // arrange
      setOnDeviceSpeechEngine(createEngine(overrides));
      await renderInput();

      // act
      await pressMic();

      // assert
      expect(speechModule.start).toHaveBeenCalledTimes(1);
      expect(speechModule.start.mock.calls[0][0].interimResults).toBe(true);
    });

    it('logs and falls back to expo recognition when startCapture rejects', async () => {
      // arrange
      const errorSpy = jest.spyOn(logger, 'error');
      setOnDeviceSpeechEngine(createEngine({ startCapture: jest.fn(async () => Promise.reject(new Error('mic'))) }));
      await renderInput();

      // act
      await pressMic();

      // assert
      expect(errorSpy).toHaveBeenCalledWith(
        '[VoiceRecognitionTextInput] on-device capture failed to start',
        expect.any(Error)
      );
      expect(speechModule.start).toHaveBeenCalledTimes(1);
    });

    it('finishes the session when the engine auto-stops', async () => {
      // arrange
      const engine = createEngine();
      setOnDeviceSpeechEngine(engine);
      const { onValueChange } = await renderInput();
      await pressMic();
      const [[onAutoStop]] = engine.startCapture.mock.calls;

      // act
      await act(async () => onAutoStop?.());

      // assert
      expect(engine.stopAndTranscribe).toHaveBeenCalledTimes(1);
      expect(onValueChange).toHaveBeenCalledWith({ value: 'on device text', recordingUri: 'file:///capture.wav' });
    });

    it('clear while capturing aborts the engine capture without touching expo', async () => {
      // arrange
      const engine = createEngine();
      setOnDeviceSpeechEngine(engine);
      const { onValueChange } = await renderInput({ value: 'typed' });
      await pressMic();

      // act
      await fireEvent.press(clearButton());

      // assert
      expect(engine.abortCapture).toHaveBeenCalledTimes(1);
      expect(speechModule.abort).not.toHaveBeenCalled();
      expect(onValueChange).toHaveBeenCalledWith({ value: '' });
    });

    it('ignores a transcription that lands after unmount and releases its audio', async () => {
      // arrange
      let finish!: (value: Transcription) => void;
      const engine = createEngine({
        stopAndTranscribe: jest.fn(() => new Promise<Transcription>((resolve) => (finish = resolve))),
      });
      setOnDeviceSpeechEngine(engine);
      const { onValueChange, unmount } = await renderInput();
      await pressMic();
      await fireEvent.press(mic());

      // act
      await unmount();
      await act(async () => finish({ text: 'late', audioUri: 'file:///late.wav' }));

      // assert
      expect(onValueChange).not.toHaveBeenCalled();
      expect(engine.releaseLastAudio).toHaveBeenCalledTimes(1);
    });

    it('clear during transcription wins: the late transcription is dropped and its audio released', async () => {
      // arrange
      let finish!: (value: Transcription) => void;
      const engine = createEngine({
        stopAndTranscribe: jest.fn(() => new Promise<Transcription>((resolve) => (finish = resolve))),
      });
      setOnDeviceSpeechEngine(engine);
      const { onValueChange } = await renderInput({ value: 'typed' });
      await pressMic();
      await fireEvent.press(mic());

      // act
      await fireEvent.press(clearButton());
      await act(async () => finish({ text: 'late', audioUri: 'file:///late.wav' }));

      // assert
      expect(onValueChange).toHaveBeenCalledTimes(1);
      expect(onValueChange).toHaveBeenCalledWith({ value: '' });
      expect(engine.abortCapture).not.toHaveBeenCalled();
      expect(speechModule.abort).not.toHaveBeenCalled();
      expect(engine.releaseLastAudio).toHaveBeenCalledTimes(1);
      expect(mic()).toBeOnTheScreen();
    });

    it('clear during a file fallback aborts expo recognition', async () => {
      // arrange
      const engine = createEngine({ stopAndTranscribe: jest.fn(async () => null) });
      setOnDeviceSpeechEngine(engine);
      const { onValueChange } = await renderInput({ value: 'typed' });
      await pressMic();
      await fireEvent.press(mic());
      await act(async () => {});

      // act
      await fireEvent.press(clearButton());
      await emitSpeechEvent('end').catch(() => undefined);

      // assert
      expect(speechModule.abort).toHaveBeenCalledTimes(1);
      expect(onValueChange).toHaveBeenCalledTimes(1);
      expect(onValueChange).toHaveBeenCalledWith({ value: '' });
    });

    it('aborts the engine capture when unmounted mid-capture', async () => {
      // arrange
      const engine = createEngine();
      setOnDeviceSpeechEngine(engine);
      const { unmount } = await renderInput();
      await pressMic();

      // act
      await unmount();

      // assert
      expect(engine.abortCapture).toHaveBeenCalledTimes(1);
      expect(speechModule.stop).not.toHaveBeenCalled();
    });
  });
});
