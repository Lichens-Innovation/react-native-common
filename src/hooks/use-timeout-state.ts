import { useEffect, useState } from 'react';

export const useTimeoutState = (timeoutMs: number) => {
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const timer = setTimeout(() => setIsLoading(false), timeoutMs);
    return () => clearTimeout(timer);
  }, [timeoutMs]);

  return isLoading;
};
