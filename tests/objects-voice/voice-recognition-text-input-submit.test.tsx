import { fireEvent, screen } from '@testing-library/react-native';
import { Keyboard } from 'react-native';
import { VoiceRecognitionTextInputSubmit } from '@lib';
import { resetMediaMocks } from './media-mocks';
import { renderWithProviders } from './render-with-providers';
import { emitSpeechEvent, resetSpeechMocks } from './speech-mocks';

jest.mock(
  'react-native-paper/lib/commonjs/components/MaterialCommunityIcon',
  () => jest.requireActual<typeof import('./paper-icon-mock')>('./paper-icon-mock').paperIconMock
);
jest.mock(
  'expo-speech-recognition',
  () => jest.requireActual<typeof import('./speech-mocks')>('./speech-mocks').expoSpeechRecognitionMock
);
jest.mock('expo-audio', () => jest.requireActual<typeof import('./media-mocks')>('./media-mocks').expoAudioMock);

type Props = Parameters<typeof VoiceRecognitionTextInputSubmit>[0];

const renderSubmit = async (props: Partial<Props> = {}) => {
  const onValueChange = jest.fn();
  const onValueSubmit = jest.fn();
  const utils = await renderWithProviders(
    <VoiceRecognitionTextInputSubmit
      value=""
      editable
      accessibilityLabel={INPUT_LABEL}
      onValueChange={onValueChange}
      onValueSubmit={onValueSubmit}
      {...props}
    />
  );
  return { onValueChange, onValueSubmit, ...utils };
};

const INPUT_LABEL = 'submit-input';

const sendButton = () => screen.getByRole('button', { name: 'icon-send' });

beforeEach(() => {
  resetSpeechMocks();
  resetMediaMocks();
});

afterEach(() => {
  jest.restoreAllMocks();
});

describe('VoiceRecognitionTextInputSubmit', () => {
  it.each`
    value
    ${''}
    ${'   '}
    ${undefined}
  `('disables send for a blank value ($value)', async ({ value }) => {
    // act
    await renderSubmit({ value });

    // assert
    expect(sendButton()).toBeDisabled();
  });

  it('submits the trimmed value, dismissing the keyboard', async () => {
    // arrange
    const dismissSpy = jest.spyOn(Keyboard, 'dismiss');
    const { onValueSubmit } = await renderSubmit({ value: '  hello  ' });

    // act
    await fireEvent.press(sendButton());

    // assert
    expect(dismissSpy).toHaveBeenCalled();
    expect(onValueSubmit).toHaveBeenCalledWith({ value: 'hello', recordingUri: undefined });
  });

  it('submits the recordingUri prop with the value', async () => {
    // arrange
    const { onValueSubmit } = await renderSubmit({ value: 'hello', recordingUri: 'file:///rec.wav' });

    // act
    await fireEvent.press(sendButton());

    // assert
    expect(onValueSubmit).toHaveBeenCalledWith({ value: 'hello', recordingUri: 'file:///rec.wav' });
  });

  it('can submit the live transcript while still dictating', async () => {
    // arrange
    const { onValueSubmit, onValueChange } = await renderSubmit({ value: 'typed' });
    await fireEvent.press(screen.getByRole('button', { name: 'icon-microphone-outline' }));
    await emitSpeechEvent('result', { results: [{ transcript: 'spoken' }] });

    // act
    await fireEvent.press(sendButton());

    // assert
    expect(onValueSubmit).toHaveBeenCalledWith({ value: 'typed spoken', recordingUri: undefined });
    expect(onValueChange).not.toHaveBeenCalled();
  });

  it('forwards typed text to onValueChange', async () => {
    // arrange
    const { onValueChange } = await renderSubmit();

    // act
    await fireEvent.changeText(screen.getByLabelText(INPUT_LABEL), 'abc');

    // assert
    expect(onValueChange).toHaveBeenCalledWith({ value: 'abc' });
  });
});
