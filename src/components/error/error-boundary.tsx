import { ErrorBoundaryProps, useRouter } from 'expo-router';
import * as Sentry from '@sentry/react-native';
import { FunctionComponent, useEffect, useLayoutEffect, useRef } from 'react';
import { logger } from '../../logger/logger';
import { useErrorDetails } from './use-error-details';

export const ErrorBoundary: FunctionComponent<ErrorBoundaryProps> = ({ error }) => {
  const router = useRouter();
  const errorDetails = useErrorDetails(error);
  // useErrorDetails returns a new id on every render: report and redirect once per error, with the latest details. habit-hooks-disable non-essential-comment
  const errorDetailsRef = useRef(errorDetails);
  useLayoutEffect(() => {
    errorDetailsRef.current = errorDetails;
  }, [errorDetails]);

  useEffect(() => {
    const { title, description, errorMsg, id, stack } = errorDetailsRef.current;
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
