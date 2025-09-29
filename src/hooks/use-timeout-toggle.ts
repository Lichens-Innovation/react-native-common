import { useToggle } from '@uidotdev/usehooks';
import { useCallback, useEffect, useRef } from 'react';

export const useTimeoutToggle = (timeoutMs: number) => {
  const [isLoading, toggleLoading] = useToggle(false);
  const timeoutRef = useRef<NodeJS.Timeout | null>(null);

  const onStartLoading = useCallback(() => {
    clearTimeout(timeoutRef.current ?? undefined);

    toggleLoading();

    timeoutRef.current = setTimeout(() => {
      toggleLoading();
      timeoutRef.current = null;
    }, timeoutMs);
  }, [timeoutMs, toggleLoading]);

  useEffect(() => {
    return () => clearTimeout(timeoutRef.current ?? undefined);
  }, []);

  return [isLoading, onStartLoading] as const;
};
