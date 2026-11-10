import type { ErrorSchema, UiSchema } from '@rjsf/utils';

export interface TextWithVoiceRecordingValue {
  text?: string;
  recordings?: string[];
}

export const normalizeTextWithVoiceRecordingValue = (rawValue: unknown): Required<TextWithVoiceRecordingValue> => {
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

export const getTextErrors = (errorSchema?: ErrorSchema): string[] | undefined => {
  const textErrorSchema: unknown = errorSchema && typeof errorSchema === 'object' ? errorSchema.text : undefined;
  if (!textErrorSchema || typeof textErrorSchema !== 'object' || !('__errors' in textErrorSchema)) return undefined;

  return textErrorSchema.__errors as string[] | undefined;
};

export const getUiPlaceholder = (uiSchema?: UiSchema): string | undefined => {
  const placeholder: unknown = uiSchema?.['ui:placeholder'];

  return typeof placeholder === 'string' ? placeholder : undefined;
};
