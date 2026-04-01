import { isNullish } from '@lichens-innovation/ts-common';
import { setAudioModeAsync, useAudioPlayer } from 'expo-audio';
import { FunctionComponent, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { IconButton } from 'react-native-paper';

export interface RecordingPlayerProps {
  /** URI of the recording to play. When null or undefined, nothing is rendered. */
  recordingUri: string | null | undefined;
}

export const RecordingPlayer: FunctionComponent<RecordingPlayerProps> = ({ recordingUri }) => {
  const { t } = useTranslation();
  const player = useAudioPlayer(recordingUri ? { uri: recordingUri } : null);

  useEffect(() => {
    setAudioModeAsync({ playsInSilentMode: true }).catch(() => {
      // Ignore if not supported (e.g. web)
    });
  }, []);

  if (isNullish(recordingUri)) {
    return null;
  }

  const handlePlay = () => {
    player.seekTo(0);
    player.play();
  };

  return <IconButton icon="play" onPress={handlePlay} accessibilityLabel={t('common:replayRecording')} />;
};
