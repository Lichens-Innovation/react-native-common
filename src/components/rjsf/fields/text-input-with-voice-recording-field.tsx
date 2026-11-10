import { getRjsfLabelColor, hasRjsfErrors, toStringOrEmpty } from '@lichens-innovation/ts-common/rjsf';
import type { FieldProps, RJSFSchema } from '@rjsf/utils';
import { useCallback, useMemo, type FunctionComponent } from 'react';
import { StyleSheet, View } from 'react-native';
import {
  type RecordingTextInputArgs,
  VoiceRecognitionTextInput,
} from '../../voice-recognition/voice-recognition.index';
import { ObjectThumbnailHorizontalList } from '../../objects/object-thumbnail-hozirontal-list';
import { useAppTheme } from '../../../theme/theme.index';
import { mergeLabelColorTheme } from '../label-color-theme';
import { getFieldDisplayLabel } from './field-display-label.utils';
import {
  getTextErrors,
  getUiPlaceholder,
  normalizeTextWithVoiceRecordingValue,
  type TextWithVoiceRecordingValue,
} from './text-input-with-voice-recording-field.utils';

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

  const { text, recordings } = normalizeTextWithVoiceRecordingValue(formData);
  const displayLabel = getFieldDisplayLabel({ schema, uiSchema, required });
  const labelColorTheme = mergeLabelColorTheme(theme, getRjsfLabelColor(uiSchema?.['ui:options']));

  const hasError = hasRjsfErrors(getTextErrors(errorSchema));
  const isLocked = readonly === true || disabled === true;

  const updateValue = useCallback(
    (next: Partial<Required<TextWithVoiceRecordingValue>>) => {
      const nextValue = {
        text: 'text' in next ? toStringOrEmpty(next.text) : text,
        recordings: 'recordings' in next ? (next.recordings ?? []) : recordings,
      };

      const baseId = fieldPathId?.$id ?? id ?? 'textWithVoiceRecordingField';
      const fieldPath = fieldPathId?.path ?? [];
      onChange(nextValue as unknown as Record<string, unknown>, fieldPath, undefined, baseId);
    },
    [onChange, text, recordings, fieldPathId, id]
  );

  const handleValueChange = useCallback(
    ({ value: nextText, recordingUri }: RecordingTextInputArgs) => {
      const nextRecordings =
        recordingUri && !recordings.includes(recordingUri) ? [...recordings, recordingUri] : recordings;

      updateValue({
        text: nextText,
        recordings: nextRecordings,
      });
    },
    [recordings, updateValue]
  );

  const handleObjectRemove = useCallback(
    (recordingToRemove: string) => {
      updateValue({
        recordings: recordings.filter((recording) => recording !== recordingToRemove),
      });
    },
    [recordings, updateValue]
  );

  return (
    <View style={styles.container}>
      <VoiceRecognitionTextInput
        mode="outlined"
        label={displayLabel}
        value={text}
        placeholder={getUiPlaceholder(uiSchema)}
        disabled={disabled}
        editable={!readonly}
        onValueChange={handleValueChange}
        onBlur={() => undefined}
        onFocus={() => undefined}
        error={hasError}
        style={styles.input}
        outlineColor={theme.colors.outline}
        theme={labelColorTheme}
      />

      <View style={styles.thumbnailsContainer}>
        <ObjectThumbnailHorizontalList onRemovePress={isLocked ? () => {} : handleObjectRemove} uris={recordings} />
      </View>
    </View>
  );
};

const useStyles = () => {
  const theme = useAppTheme();

  return useMemo(
    () =>
      StyleSheet.create({
        container: {
          marginVertical: theme.spacing(0.5),
        },
        input: {
          marginVertical: theme.spacing(0.5),
        },
        thumbnailsContainer: {
          marginHorizontal: theme.spacing(1),
        },
      }),
    [theme]
  );
};
