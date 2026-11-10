import { getErrorMessage } from '@lichens-innovation/ts-common';
import type { AudioPlayer, AudioStatus } from 'expo-audio';
import type { VideoPlayer } from 'expo-video';
import { logger } from '../../../logger/logger';

const logPlayerError = (failureMessage: string, error: unknown): void => {
  logger.error(`${failureMessage}: ${getErrorMessage(error)}`);
};

export const rewindAudio = (player: AudioPlayer, failureMessage: string): void => {
  try {
    player.pause();
    player.seekTo(0).catch((error: unknown) => logPlayerError(failureMessage, error));
  } catch (error) {
    logPlayerError(failureMessage, error);
  }
};

export const rewindVideo = (player: VideoPlayer, failureMessage: string): void => {
  try {
    player.pause();
    player.currentTime = 0;
  } catch (error) {
    logPlayerError(failureMessage, error);
  }
};

export const startVideo = (player: VideoPlayer): void => {
  try {
    player.play();
  } catch (error) {
    logPlayerError('Error starting video playback', error);
  }
};

export const toggleAudioPlayback = (player: AudioPlayer, status: AudioStatus): void => {
  try {
    if (status.playing) {
      player.pause();
      return;
    }

    // expo-audio does not automatically reset to the beginning after finishing. habit-hooks-disable non-essential-comment
    const duration = status.duration ?? 0;
    const currentTime = status.currentTime ?? 0;
    if (duration > 0 && currentTime >= duration) {
      player.seekTo(0).catch((error: unknown) => logPlayerError('Error toggling playback', error));
    }

    player.play();
  } catch (error) {
    logPlayerError('Error toggling playback', error);
  }
};

export const formatPlaybackTime = (seconds: number): string => {
  const totalSeconds = Math.floor(seconds);
  const minutes = Math.floor(totalSeconds / 60);
  const remainingSeconds = totalSeconds % 60;
  return `${minutes}:${remainingSeconds.toString().padStart(2, '0')}`;
};
