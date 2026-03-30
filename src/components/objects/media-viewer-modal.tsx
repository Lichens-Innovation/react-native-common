import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { View, TouchableOpacity, Image, StyleSheet, Dimensions, Text } from 'react-native';
import { Icon } from 'react-native-paper';
import { useAudioPlayer, useAudioPlayerStatus } from 'expo-audio';
import { useVideoPlayer, VideoView } from 'expo-video';
import { AppModal } from '../modal/app-modal';
import { logger } from '../../logger/logger';
import { getErrorMessage } from '@lichens-innovation/ts-common';
import { getMediaTypeFromUri } from '../../utils/object.utils';

const { width, height } = Dimensions.get('window');

interface ViewerModalProps {
  visible: boolean;
  uri: string | null;
  onClose: () => void;
}

const ViewerModal: React.FC<ViewerModalProps> = ({ visible, uri, onClose: onRequestClose }) => {
  const [audioError, setAudioError] = useState<string | null>(null);
  const type = getMediaTypeFromUri(uri);
  // Only provide a source when we actually want audio loaded.
  const audioSource = useMemo(() => {
    return visible && type === 'audio' && uri ? uri : null;
  }, [visible, type, uri]);

  const audioPlayer = useAudioPlayer(audioSource, {
    updateInterval: 500,
  });

  const audioStatus = useAudioPlayerStatus(audioPlayer);

  // Only provide a source when we actually want video loaded.
  const videoSource = useMemo(() => {
    return visible && type === 'video' && uri ? uri : null;
  }, [visible, type, uri]);

  const videoPlayer = useVideoPlayer(videoSource, (player) => {
    player.loop = false;
    if (visible && type === 'video') {
      player.play();
    }
  });

  useEffect(() => {
    if (type === 'audio') {
      setAudioError(null);
      try {
        audioPlayer.pause();
        audioPlayer.seekTo(0);
      } catch (error) {
        logger.error(`Error preparing audio: ${getErrorMessage(error)}`);
      }
    }
  }, [type, uri, audioPlayer]);

  useEffect(() => {
    if (!visible) {
      try {
        audioPlayer.pause();
        audioPlayer.seekTo(0);
      } catch (error) {
        logger.error(`Error resetting audio on close: ${getErrorMessage(error)}`);
      }

      try {
        videoPlayer.pause();
        videoPlayer.currentTime = 0;
      } catch (error) {
        logger.error(`Error resetting video on close: ${getErrorMessage(error)}`);
      }
      return;
    }

    if (visible && type === 'video') {
      try {
        videoPlayer.play();
      } catch (error) {
        logger.error(`Error starting video playback: ${getErrorMessage(error)}`);
      }
    }
  }, [visible, type, audioPlayer, videoPlayer]);

  const handleClose = useCallback(() => {
    try {
      audioPlayer.pause();
      audioPlayer.seekTo(0);
    } catch (error) {
      logger.error(`Error closing audio player: ${getErrorMessage(error)}`);
    }

    try {
      videoPlayer.pause();
      videoPlayer.currentTime = 0;
    } catch (error) {
      logger.error(`Error closing video player: ${getErrorMessage(error)}`);
    }

    setAudioError(null);
    onRequestClose();
  }, [audioPlayer, videoPlayer, onRequestClose]);

  const togglePlayPause = useCallback(() => {
    try {
      if (audioStatus.playing) {
        audioPlayer.pause();
        return;
      }

      const duration = audioStatus.duration ?? 0;
      const currentTime = audioStatus.currentTime ?? 0;

      // expo-audio does not automatically reset to the beginning after finishing.
      if (duration > 0 && currentTime >= duration) {
        audioPlayer.seekTo(0);
      }

      audioPlayer.play();
    } catch (error) {
      logger.error(`Error toggling playback: ${getErrorMessage(error)}`);
    }
  }, [audioPlayer, audioStatus.playing, audioStatus.duration, audioStatus.currentTime]);

  const formatTime = useCallback((seconds: number) => {
    const totalSeconds = Math.floor(seconds);
    const minutes = Math.floor(totalSeconds / 60);
    const remainingSeconds = totalSeconds % 60;
    return `${minutes}:${remainingSeconds.toString().padStart(2, '0')}`;
  }, []);

  const durationSeconds = audioStatus.duration ?? 0;
  const positionSeconds = audioStatus.currentTime ?? 0;
  const hasDuration = durationSeconds > 0;

  return (
    <AppModal visible={visible} transparent animationType="fade" onRequestClose={handleClose}>
      <View style={styles.viewerOverlay}>
        <TouchableOpacity style={styles.closeButton} onPress={handleClose} activeOpacity={0.7}>
          <Icon source="close" size={32} color="#fff" />
        </TouchableOpacity>

        {type === 'image' && uri && <Image source={{ uri }} style={styles.fullscreenImage} resizeMode="contain" />}

        {type === 'video' && uri && (
          <VideoView player={videoPlayer} style={styles.fullscreenVideo} contentFit="contain" nativeControls />
        )}

        {type === 'audio' && uri && (
          <View style={styles.audioContainer}>
            <Text style={styles.audioTitle}>Enregistrement audio</Text>

            {audioError ? (
              <View style={styles.errorContainer}>
                <Icon source="alert-circle" size={60} color="#ff6b6b" />
                <Text style={styles.errorText}>{audioError}</Text>
              </View>
            ) : (
              <>
                <TouchableOpacity style={styles.playButton} onPress={togglePlayPause}>
                  <Icon source={audioStatus.playing ? 'pause' : 'play'} size={60} color="#fff" />
                </TouchableOpacity>

                {hasDuration && (
                  <Text style={styles.timeText}>
                    {formatTime(positionSeconds)} / {formatTime(durationSeconds)}
                  </Text>
                )}
              </>
            )}
          </View>
        )}
      </View>
    </AppModal>
  );
};

export default ViewerModal;

const styles = StyleSheet.create({
  viewerOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.9)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  fullscreenImage: {
    width: width * 0.9,
    height: height * 0.8,
  },
  fullscreenVideo: {
    width: width * 0.9,
    height: height * 0.5,
  },
  closeButton: {
    position: 'absolute',
    top: 40,
    right: 20,
    zIndex: 10,
    backgroundColor: 'rgba(0,0,0,0.5)',
    borderRadius: 20,
    padding: 4,
  },
  audioContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 40,
  },
  audioTitle: {
    color: '#fff',
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 40,
  },
  playButton: {
    width: 120,
    height: 120,
    borderRadius: 60,
    backgroundColor: 'rgba(255,255,255,0.2)',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 40,
  },
  timeText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '500',
    marginBottom: 15,
  },
  errorContainer: {
    alignItems: 'center',
    marginBottom: 40,
  },
  errorText: {
    color: '#ff6b6b',
    fontSize: 18,
    marginTop: 20,
    textAlign: 'center',
  },
});
