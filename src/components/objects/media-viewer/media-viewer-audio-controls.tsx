import { useAudioPlayerStatus, type AudioPlayer } from 'expo-audio';
import { FunctionComponent } from 'react';
import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { Icon } from 'react-native-paper';
import { formatPlaybackTime, toggleAudioPlayback } from './media-player-controls';

interface MediaViewerAudioControlsProps {
  player: AudioPlayer;
}

export const MediaViewerAudioControls: FunctionComponent<MediaViewerAudioControlsProps> = ({ player }) => {
  const status = useAudioPlayerStatus(player);
  const durationSeconds = status.duration ?? 0;
  const positionSeconds = status.currentTime ?? 0;
  const hasDuration = durationSeconds > 0;

  return (
    <View style={styles.audioContainer}>
      <Text style={styles.audioTitle}>Enregistrement audio</Text>

      <TouchableOpacity style={styles.playButton} onPress={() => toggleAudioPlayback(player, status)}>
        <Icon source={status.playing ? 'pause' : 'play'} size={60} color="#fff" />
      </TouchableOpacity>

      {hasDuration && (
        <Text style={styles.timeText}>
          {formatPlaybackTime(positionSeconds)} / {formatPlaybackTime(durationSeconds)}
        </Text>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
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
});
