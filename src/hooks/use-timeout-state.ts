import { useToggle } from '@uidotdev/usehooks';
import { useEffect } from 'react';

export const useTimeoutState = (timeoutMs: number) => {
  const [isLoading, toggleLoading] = useToggle(true);

  useEffect(() => {
    const timer = setTimeout(toggleLoading, timeoutMs);
    return () => clearTimeout(timer);
  }, []);

  return isLoading;
};
