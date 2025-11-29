import { useTranslation } from 'react-i18next';
import uuid from 'react-native-uuid';
import { getErrorMessage } from '../../utils/errors.utils';

export const useErrorDetails = (error: unknown) => {
  const { t } = useTranslation();

  const id = uuid.v4();
  const title = t('common:error');
  const errorMsg = getErrorMessage(error) || 'Unknown';
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
