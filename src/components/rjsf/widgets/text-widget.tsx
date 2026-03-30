import {
  getRjsfDisplayLabel,
  getRjsfTextChangeValue,
  hasRjsfErrors,
  toStringOrEmpty,
} from '@lichens-innovation/ts-common/rjsf';
import type { WidgetProps } from '@rjsf/utils';
import type { FunctionComponent } from 'react';
import { StyleSheet, View } from 'react-native';
import { type RecordingTextInputArgs, VoiceRecognitionTextInput } from '../../../components/voice-recognition';
import { ObjectThumbnailHorizontalList } from '../../objects/object-thumbnail-hozirontal-list';
import { useAppTheme } from '../../../theme';

type VoiceTextValue = {
  text?: string;
  recordings?: string[];
};

type TextWidgetOptions = {
  persistRecording?: boolean;
  emptyValue?: unknown;
};

const parseVoiceTextValue = (rawValue: unknown): VoiceTextValue => {
  if (typeof rawValue !== 'string' || rawValue.trim() === '') {
    return { text: '', recordings: [] };
  }

  try {
    const parsed = JSON.parse(rawValue);

    if (typeof parsed === 'object' && parsed !== null && !Array.isArray(parsed)) {
      return {
        text: typeof parsed.text === 'string' ? parsed.text : '',
        recordings: Array.isArray(parsed.recordings)
          ? parsed.recordings.filter((uri: string): uri is string => typeof uri === 'string')
          : [],
      };
    }
  } catch {
    return { text: rawValue, recordings: [] };
  }

  return { text: '', recordings: [] };
};

const stringifyVoiceTextValue = (value: VoiceTextValue): string => {
  return JSON.stringify({
    text: toStringOrEmpty(value.text),
    recordings: Array.isArray(value.recordings) ? value.recordings : [],
  });
};

// Widget for rendering a text input with optional voice recording persistence. When persistRecording is false, value is directly the text string.
// When persistRecording is true, the value is expected to be a JSON string containing both the text and an array of recording URIs (uris for rendering, but in the real formData the object_uuids should be used)
export const TextWidget: FunctionComponent<WidgetProps> = ({
  id,
  value,
  disabled,
  readonly,
  placeholder,
  onChange,
  onBlur,
  onFocus,
  label,
  hideLabel,
  required,
  rawErrors,
  options,
}) => {
  const theme = useAppTheme();
  const styles = useStyles();
  const hasError = hasRjsfErrors(rawErrors);
  const displayLabel = getRjsfDisplayLabel({ label, required, hideLabel });

  const widgetOptions = (options ?? {}) as TextWidgetOptions;
  const persistRecording = widgetOptions.persistRecording ?? false;

  const parsedValue = persistRecording ? parseVoiceTextValue(value) : { text: toStringOrEmpty(value), recordings: [] };

  const currentText = toStringOrEmpty(parsedValue.text);
  const recordings = Array.isArray(parsedValue.recordings) ? parsedValue.recordings : [];

  const handleValueChange = ({ value: nextText, recordingUri }: RecordingTextInputArgs) => {
    const normalizedText = getRjsfTextChangeValue({
      text: nextText,
      emptyValue: widgetOptions.emptyValue,
    });

    if (persistRecording) {
      const nextRecordings =
        recordingUri && !recordings.includes(recordingUri) ? [...recordings, recordingUri] : recordings;

      onChange(
        stringifyVoiceTextValue({
          text: typeof normalizedText === 'string' ? normalizedText : toStringOrEmpty(normalizedText),
          recordings: nextRecordings,
        })
      );
      return;
    }

    onChange(normalizedText);
  };

  const handleObjectRemove = (recordingToRemove: string) => {
    if (!persistRecording) return;

    const nextValue = stringifyVoiceTextValue({
      text: currentText,
      recordings: recordings.filter((recording) => recording !== recordingToRemove),
    });

    onChange(nextValue);
    onBlur(id, nextValue);
  };

  const blurValue = persistRecording
    ? stringifyVoiceTextValue({
        text: currentText,
        recordings: recordings,
      })
    : value;

  return (
    <>
      <VoiceRecognitionTextInput
        mode="outlined"
        label={displayLabel}
        value={currentText}
        placeholder={placeholder}
        disabled={disabled}
        editable={!readonly}
        onValueChange={handleValueChange}
        onBlur={() => onBlur(id, blurValue)}
        onFocus={() => onFocus(id, blurValue)}
        error={hasError}
        style={styles.input}
        outlineColor={theme.colors.outline}
      />
      {persistRecording && (
        <View style={styles.thumbnailsContainer}>
          <ObjectThumbnailHorizontalList onRemovePress={handleObjectRemove} uris={recordings} />
        </View>
      )}
    </>
  );
};

const useStyles = () => {
  const theme = useAppTheme();
  return StyleSheet.create({
    input: {
      marginVertical: theme.spacing(0.5),
    },
    thumbnailsContainer: {
      marginHorizontal: theme.spacing(1),
    },
  });
};
