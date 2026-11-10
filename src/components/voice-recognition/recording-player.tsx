import { isNullish } from '@lichens-innovation/ts-common';
import { setAudioModeAsync, useAudioPlayer } from 'expo-audio';
import { FunctionComponent, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { IconButton } from 'react-native-paper';
import { logger } from '../../logger/logger';

export interface RecordingPlayerProps {
  recordingUri?: string | null;
}

export const RecordingPlayer: FunctionComponent<RecordingPlayerProps> = ({ recordingUri }) => {
  const { t } = useTranslation();
  const player = useAudioPlayer(recordingUri ? { uri: recordingUri } : null);

  useEffect(() => {
    setAudioModeAsync({ playsInSilentMode: true }).catch((e: unknown) => {
      logger.debug('[RecordingPlayer] Audio mode not supported on this platform', e);
    });
  }, []);

  if (isNullish(recordingUri)) {
    return null;
  }

  const handlePlay = () => {
    void player.seekTo(0);
    player.play();
  };

  return <IconButton icon="play" onPress={handlePlay} accessibilityLabel={t('common:replayRecording')} />;
};
