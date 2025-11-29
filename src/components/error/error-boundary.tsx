import { ErrorBoundaryProps, useRouter } from 'expo-router';
import * as Sentry from '@sentry/react-native';
import { FunctionComponent, useEffect } from 'react';
import { logger } from '../../logger/logger';
import { useErrorDetails } from './use-error-details';

export const ErrorBoundary: FunctionComponent<ErrorBoundaryProps> = ({ error }) => {
  const router = useRouter();
  const { title, description, errorMsg, id, stack } = useErrorDetails(error);

  useEffect(() => {
    logger.error(`ErrorBoundary Unexpected error: ${errorMsg} (ID: ${id}). Stack: ${stack}`, error);
    Sentry.captureException(error, {
      extra: {
        title,
        description,
        errorMsg,
        id,
        stack,
      },
    });

    router.replace({
      pathname: '/error',
      params: { title, description, errorMsg, id },
    });
  }, [router, error]);

  return null;
};
