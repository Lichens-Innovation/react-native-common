import { useRouter } from 'expo-router';
import { useEffect } from 'react';
import { logger } from '../../logger/logger';
import { useErrorDetails } from './use-error-details';
export const ErrorBoundary = ({ error }) => {
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
//# sourceMappingURL=error-boundary.js.map