import { FunctionComponent } from 'react';
import { useTranslation } from 'react-i18next';
import { StyleSheet, View } from 'react-native';
import { IconButton, TextInput, TextInputProps } from 'react-native-paper';
import { RecordingPlayer } from '../recording-player';
import type { MicPosition } from './dictation-session.types';

const RIGHT_BUTTONS_WIDTH = 64;

interface DictationTextFieldProps extends TextInputProps {
  micPosition: MicPosition;
  showPlayback: boolean;
  showClear: boolean;
  recordingUri?: string | null;
  isClearDisabled: boolean;
  onClear: () => void;
}

export const DictationTextField: FunctionComponent<DictationTextFieldProps> = ({
  micPosition,
  showPlayback,
  showClear,
  recordingUri,
  isClearDisabled,
  onClear,
  style,
  ...textInputProps
}) => {
  const { t } = useTranslation();
  // Playback and clear sit on top of the input, so room is only reserved when one is rendered. habit-hooks-disable non-essential-comment
  const hasRightButtons = showPlayback || showClear;

  return (
    // In a column, `flex: 1` with no height to share would collapse the field. habit-hooks-disable non-essential-comment
    <View style={micPosition === 'below' ? styles.inputWrapperBelow : styles.inputWrapper}>
      <TextInput
        {...textInputProps}
        style={[styles.textInput, hasRightButtons && styles.textInputWithRightButtons, style]}
      />
      <View style={styles.rightButtonsOverlay} pointerEvents="box-none">
        <View style={styles.rightButtons} pointerEvents="auto">
          {showPlayback && <RecordingPlayer recordingUri={recordingUri} />}
          {showClear && (
            <IconButton
              icon="close"
              onPress={onClear}
              disabled={isClearDisabled}
              accessibilityLabel={t('common:close')}
            />
          )}
        </View>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  inputWrapperBelow: {
    position: 'relative',
  },
  inputWrapper: {
    position: 'relative',
    flex: 1,
  },
  textInput: {
    flex: 1,
  },
  textInputWithRightButtons: {
    paddingRight: RIGHT_BUTTONS_WIDTH,
  },
  rightButtonsOverlay: {
    position: 'absolute',
    top: 0,
    right: 0,
    bottom: 0,
    justifyContent: 'center',
  },
  rightButtons: {
    flexDirection: 'row',
  },
});
