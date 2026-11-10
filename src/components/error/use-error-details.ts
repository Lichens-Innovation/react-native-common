import { getErrorMessage, isBlank } from '@lichens-innovation/ts-common';
import { useTranslation } from 'react-i18next';
import uuid from 'react-native-uuid';

export const useErrorDetails = (error: unknown) => {
  const { t } = useTranslation();

  const id = uuid.v4();
  const title = t('common:error');
  const rawErrorMessage = getErrorMessage(error);
  const errorMsg = isBlank(rawErrorMessage) ? 'Unknown' : rawErrorMessage;
  const description = t('common:errorBoundary.error', { id, errorMsg });
  const stack = error instanceof Error ? error.stack : '';

  return {
    id,
    title,
    errorMsg,
    description,
    stack,
  };
};
