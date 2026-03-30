import { getRjsfDisplayLabel, hasRjsfErrors, toStringOrEmpty } from '@lichens-innovation/ts-common/rjsf';
import type { FieldProps, RJSFSchema } from '@rjsf/utils';
import type { FunctionComponent } from 'react';
import { StyleSheet, View } from 'react-native';
import { type RecordingTextInputArgs, VoiceRecognitionTextInput } from '../../voice-recognition';
import { ObjectThumbnailHorizontalList } from '../../objects/object-thumbnail-hozirontal-list';
import { useAppTheme } from '../../../theme';

type TextWithVoiceRecordingValue = {
  text?: string;
  recordings?: string[];
};

const normalizeValue = (rawValue: unknown): Required<TextWithVoiceRecordingValue> => {
  if (!rawValue || typeof rawValue !== 'object' || Array.isArray(rawValue)) {
    return { text: '', recordings: [] };
  }

  const value = rawValue as TextWithVoiceRecordingValue;

  return {
    text: typeof value.text === 'string' ? value.text : '',
    recordings: Array.isArray(value.recordings)
      ? value.recordings.filter((item): item is string => typeof item === 'string')
      : [],
  };
};

export const TextWithVoiceRecordingField: FunctionComponent<FieldProps<Record<string, unknown>, RJSFSchema>> = ({
  formData,
  onChange,
  schema,
  uiSchema,
  disabled,
  readonly,
  required,
  errorSchema,
  fieldPathId,
  id,
}) => {
  const styles = useStyles();
  const theme = useAppTheme();

  const normalized = normalizeValue(formData);
  const text = normalized.text;
  const recordings = normalized.recordings;

  const label = typeof schema.title === 'string' ? schema.title : '';
  const hideLabel = uiSchema?.['ui:options']?.label === false;
  const displayLabel = getRjsfDisplayLabel({ label, required, hideLabel });

  const textErrors =
    errorSchema &&
    typeof errorSchema === 'object' &&
    'text' in errorSchema &&
    errorSchema.text &&
    typeof errorSchema.text === 'object' &&
    '__errors' in errorSchema.text
      ? (errorSchema.text.__errors as string[] | undefined)
      : undefined;

  const hasError = hasRjsfErrors(textErrors);

  const baseId = fieldPathId?.$id ?? id ?? 'textWithVoiceRecordingField';
  const fieldPath = fieldPathId?.path ?? [];

  const updateValue = (next: Partial<Required<TextWithVoiceRecordingValue>>) => {
    const nextValue = {
      text: 'text' in next ? toStringOrEmpty(next.text) : text,
      recordings: 'recordings' in next ? (next.recordings ?? []) : recordings,
    };

    onChange(nextValue as unknown as Record<string, unknown>, fieldPath, undefined, baseId);
  };

  const handleValueChange = ({ value: nextText, recordingUri }: RecordingTextInputArgs) => {
    const nextRecordings =
      recordingUri && !recordings.includes(recordingUri) ? [...recordings, recordingUri] : recordings;

    updateValue({
      text: nextText,
      recordings: nextRecordings,
    });
  };

  const handleObjectRemove = (recordingToRemove: string) => {
    updateValue({
      recordings: recordings.filter((recording) => recording !== recordingToRemove),
    });
  };

  return (
    <View style={styles.container}>
      <VoiceRecognitionTextInput
        mode="outlined"
        label={displayLabel}
        value={text}
        placeholder={typeof uiSchema?.['ui:placeholder'] === 'string' ? uiSchema['ui:placeholder'] : undefined}
        disabled={disabled}
        editable={!readonly}
        onValueChange={handleValueChange}
        onBlur={() => undefined}
        onFocus={() => undefined}
        error={hasError}
        style={styles.input}
        outlineColor={theme.colors.outline}
      />

      <View style={styles.thumbnailsContainer}>
        <ObjectThumbnailHorizontalList
          onRemovePress={readonly || disabled ? () => {} : handleObjectRemove}
          uris={recordings}
        />
      </View>
    </View>
  );
};

const useStyles = () => {
  const theme = useAppTheme();

  return StyleSheet.create({
    container: {
      marginVertical: theme.spacing(0.5),
    },
    input: {
      marginVertical: theme.spacing(0.5),
    },
    thumbnailsContainer: {
      marginHorizontal: theme.spacing(1),
    },
  });
};
