import { FunctionComponent } from 'react';
import { ActivityIndicator, StyleSheet } from 'react-native';
import { IconButton } from 'react-native-paper';
import type { MicPosition } from './dictation-session.types';

const MIC_HIT_SLOP = { top: 12, bottom: 12, left: 12, right: 12 };

interface DictationMicButtonProps {
  micPosition: MicPosition;
  isBusy: boolean;
  isRecording: boolean;
  disabled: boolean;
  onPress: () => void;
  onLongPress?: () => void;
}

export const DictationMicButton: FunctionComponent<DictationMicButtonProps> = ({
  micPosition,
  isBusy,
  isRecording,
  disabled,
  onPress,
  onLongPress,
}) => {
  const isBelow = micPosition === 'below';
  const style = isBelow ? styles.micBelow : styles.micButton;

  if (isBusy) {
    /* habit-hooks-disable non-essential-comment
     * Transcription runs for a few seconds after stop; without this the field just sits there
     * looking broken.
     */
    return <ActivityIndicator size={28} style={style} testID="dictation-busy" />;
  }

  return (
    <IconButton
      mode="contained"
      size={isBelow ? 40 : 28}
      hitSlop={MIC_HIT_SLOP}
      icon={isRecording ? 'stop' : 'microphone-outline'}
      onPress={onPress}
      onLongPress={onLongPress}
      disabled={disabled}
      style={style}
      testID="dictation-mic"
    />
  );
};

const styles = StyleSheet.create({
  micBelow: {
    alignSelf: 'center',
  },
  micButton: {
    marginLeft: 4,
    marginRight: -4,
  },
});
