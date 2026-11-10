import { View } from 'react-native';

interface MockAudioStatus {
  playing: boolean;
  duration?: number;
  currentTime?: number;
}

interface MediaState {
  audioStatus: MockAudioStatus;
}

interface MockExpoImageProps {
  source: unknown;
}

export const audioPlayer = {
  play: jest.fn(),
  pause: jest.fn(),
  seekTo: jest.fn(() => Promise.resolve()),
};

export const videoPlayer = {
  play: jest.fn(),
  pause: jest.fn(),
  loop: true,
  currentTime: 0,
};

export const mediaState: MediaState = {
  audioStatus: { playing: false, duration: 0, currentTime: 0 },
};

export const expoAudioMock = {
  __esModule: true,
  useAudioPlayer: jest.fn(() => audioPlayer),
  useAudioPlayerStatus: jest.fn(() => mediaState.audioStatus),
  setAudioModeAsync: jest.fn(() => Promise.resolve()),
};

export const expoVideoMock = {
  __esModule: true,
  useVideoPlayer: jest.fn((_source: unknown, setup?: (player: typeof videoPlayer) => void) => {
    setup?.(videoPlayer);
    return videoPlayer;
  }),
  VideoView: jest.fn(() => <View accessibilityLabel="video-view" />),
};

export const resetMediaMocks = () => {
  audioPlayer.play.mockReset();
  audioPlayer.pause.mockReset();
  audioPlayer.seekTo.mockReset().mockImplementation(() => Promise.resolve());
  videoPlayer.play.mockReset();
  videoPlayer.pause.mockReset();
  videoPlayer.loop = true;
  videoPlayer.currentTime = 0;
  mediaState.audioStatus = { playing: false, duration: 0, currentTime: 0 };
  expoAudioMock.useAudioPlayer.mockClear();
  expoAudioMock.setAudioModeAsync.mockClear();
  expoVideoMock.useVideoPlayer.mockClear();
};

export const expoImageMock = {
  __esModule: true,
  Image: ({ source }: MockExpoImageProps) => <View accessibilityLabel={`expo-image:${String(source)}`} />,
};
