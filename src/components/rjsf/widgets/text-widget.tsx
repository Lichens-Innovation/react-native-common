import type { WidgetProps } from '@rjsf/utils';
import { useCallback, type FunctionComponent } from 'react';
import {
  type RecordingTextInputArgs,
  VoiceRecognitionTextInput,
} from '../../voice-recognition/voice-recognition.index';
import { useTextEntryProps } from './shared/use-text-entry-props';

export const TextWidget: FunctionComponent<WidgetProps> = (props) => {
  const { inputProps, changeText } = useTextEntryProps(props);

  const handleValueChange = useCallback(({ value }: RecordingTextInputArgs) => changeText(value), [changeText]);

  return <VoiceRecognitionTextInput {...inputProps} onValueChange={handleValueChange} />;
};
