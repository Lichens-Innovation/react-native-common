import { fireEvent, screen } from '@testing-library/react-native';
import { RecordingPlayer } from '@lib';
import { audioPlayer, expoAudioMock, resetMediaMocks } from './media-mocks';
import { renderWithProviders } from './render-with-providers';

jest.mock(
  'react-native-paper/lib/commonjs/components/MaterialCommunityIcon',
  () => jest.requireActual<typeof import('./paper-icon-mock')>('./paper-icon-mock').paperIconMock
);
jest.mock('expo-audio', () => jest.requireActual<typeof import('./media-mocks')>('./media-mocks').expoAudioMock);

beforeEach(() => {
  resetMediaMocks();
});

describe('RecordingPlayer', () => {
  it.each`
    recordingUri
    ${null}
    ${undefined}
  `('renders nothing and loads no source for recordingUri=$recordingUri', async ({ recordingUri }) => {
    // act
    await renderWithProviders(<RecordingPlayer recordingUri={recordingUri} />);

    // assert
    expect(screen.queryByRole('button')).toBeNull();
    expect(expoAudioMock.useAudioPlayer).toHaveBeenLastCalledWith(null);
  });

  it('renders the replay button for an empty-string uri but loads no source', async () => {
    // act
    await renderWithProviders(<RecordingPlayer recordingUri="" />);

    // assert
    expect(screen.getByRole('button', { name: 'replayRecording' })).toBeOnTheScreen();
    expect(expoAudioMock.useAudioPlayer).toHaveBeenLastCalledWith(null);
  });

  it('loads the recording and replays it from the start on press', async () => {
    // arrange
    await renderWithProviders(<RecordingPlayer recordingUri="file:///rec.wav" />);

    // act
    await fireEvent.press(screen.getByRole('button', { name: 'replayRecording' }));

    // assert
    expect(expoAudioMock.useAudioPlayer).toHaveBeenLastCalledWith({ uri: 'file:///rec.wav' });
    expect(screen.getByLabelText('icon-play')).toBeOnTheScreen();
    expect(audioPlayer.seekTo).toHaveBeenCalledWith(0);
    expect(audioPlayer.play).toHaveBeenCalledTimes(1);
  });

  it('enables playback in silent mode once on mount, even when nothing is rendered', async () => {
    // act
    await renderWithProviders(<RecordingPlayer recordingUri={null} />);

    // assert
    expect(expoAudioMock.setAudioModeAsync).toHaveBeenCalledWith({ playsInSilentMode: true });
  });

  it('swallows a setAudioModeAsync rejection', async () => {
    // arrange
    expoAudioMock.setAudioModeAsync.mockRejectedValueOnce(new Error('unsupported'));

    // act
    await renderWithProviders(<RecordingPlayer recordingUri="file:///rec.wav" />);

    // assert
    expect(screen.getByRole('button', { name: 'replayRecording' })).toBeOnTheScreen();
  });
});
