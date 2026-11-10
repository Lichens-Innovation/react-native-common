import { useAudioPlayer, type AudioPlayer } from 'expo-audio';
import { useVideoPlayer, type VideoPlayer } from 'expo-video';
import { useEffect } from 'react';
import type { MediaType } from '../../../utils/object.utils';
import { rewindAudio, rewindVideo, startVideo } from './media-player-controls';

const AUDIO_STATUS_UPDATE_INTERVAL_MS = 500;

interface UseMediaViewerPlayersArgs {
  visible: boolean;
  type?: MediaType;
  uri: string | null;
}

interface MediaViewerPlayers {
  audioPlayer: AudioPlayer;
  videoPlayer: VideoPlayer;
  stopPlayback: () => void;
}

const sourceWhenShowing = ({ visible, type, uri }: UseMediaViewerPlayersArgs, wanted: MediaType): string | null =>
  visible && type === wanted && uri ? uri : null;

export const useMediaViewerPlayers = (args: UseMediaViewerPlayersArgs): MediaViewerPlayers => {
  const { visible, type, uri } = args;
  const audioPlayer = useAudioPlayer(sourceWhenShowing(args, 'audio'), {
    updateInterval: AUDIO_STATUS_UPDATE_INTERVAL_MS,
  });
  const videoPlayer = useVideoPlayer(sourceWhenShowing(args, 'video'), (player) => {
    player.loop = false;
    if (visible && type === 'video') startVideo(player);
  });

  useEffect(() => {
    if (type === 'audio') rewindAudio(audioPlayer, 'Error preparing audio');
  }, [type, uri, audioPlayer]);

  useEffect(() => {
    if (visible) {
      if (type === 'video') startVideo(videoPlayer);
      return;
    }
    rewindAudio(audioPlayer, 'Error resetting audio on close');
    rewindVideo(videoPlayer, 'Error resetting video on close');
  }, [visible, type, audioPlayer, videoPlayer]);

  const stopPlayback = () => {
    rewindAudio(audioPlayer, 'Error closing audio player');
    rewindVideo(videoPlayer, 'Error closing video player');
  };

  return { audioPlayer, videoPlayer, stopPlayback };
};
