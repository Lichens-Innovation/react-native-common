import type { WidgetProps } from '@rjsf/utils';
import { useCallback, type FunctionComponent } from 'react';
import { StyleSheet } from 'react-native';
import {
  type RecordingTextInputArgs,
  VoiceRecognitionTextInput,
} from '../../voice-recognition/voice-recognition.index';
import { useTextEntryProps } from './shared/use-text-entry-props';

const DEFAULT_NUMBER_OF_LINES = 4;

export const TextareaWidget: FunctionComponent<WidgetProps> = (props) => {
  const { inputProps, changeText } = useTextEntryProps(props);
  const { options } = props;
  const numberOfLines = options?.numberOfLines ?? DEFAULT_NUMBER_OF_LINES;

  const handleValueChange = useCallback(({ value }: RecordingTextInputArgs) => changeText(value), [changeText]);

  return (
    <VoiceRecognitionTextInput
      {...inputProps}
      multiline
      numberOfLines={numberOfLines}
      onValueChange={handleValueChange}
      style={[inputProps.style, styles.textarea]}
    />
  );
};

const styles = StyleSheet.create({
  textarea: {
    minHeight: 100,
  },
});
