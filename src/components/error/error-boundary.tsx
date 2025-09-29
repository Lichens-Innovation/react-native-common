import { ErrorBoundaryProps, useRouter } from 'expo-router';
import { FunctionComponent, useEffect } from 'react';
import { logger } from '../../logger/logger';
import { useErrorDetails } from './use-error-details';

export const ErrorBoundary: FunctionComponent<ErrorBoundaryProps> = ({ error }) => {
  const router = useRouter();
  const { title, description, errorMsg, id } = useErrorDetails(error);

  useEffect(() => {
    logger.error(`ErrorBoundary Unexpected error: ${errorMsg} (ID: ${id})`, error);

    router.replace({
      pathname: '/error',
      params: { title, description, errorMsg, id },
    });
  }, [router, error]);

  return null;
};
