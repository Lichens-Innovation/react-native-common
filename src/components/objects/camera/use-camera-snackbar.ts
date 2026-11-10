import { useCallback, useEffect, useRef, useState, type RefObject } from 'react';
import { Animated } from 'react-native';

const SNACKBAR_FADE_IN_MS = 200;
const SNACKBAR_FADE_OUT_MS = 300;
const SNACKBAR_VISIBLE_MS = 3000;

type Timer = ReturnType<typeof setTimeout>;

const fadeSnackbar = (anim: Animated.Value, toValue: number, duration: number) =>
  Animated.timing(anim, { toValue, duration, useNativeDriver: true });

const clearHideTimer = (hideTimerRef: RefObject<Timer | null>): void => {
  if (hideTimerRef.current) {
    clearTimeout(hideTimerRef.current);
    hideTimerRef.current = null;
  }
};

interface CameraSnackbar {
  message: string | null;
  anim: Animated.Value;
  show: (message: string) => void;
}

export const useCameraSnackbar = (): CameraSnackbar => {
  const [message, setMessage] = useState<string | null>(null);
  const [anim] = useState(() => new Animated.Value(0));
  const hideTimerRef = useRef<Timer | null>(null);

  const show = useCallback(
    (next: string) => {
      clearHideTimer(hideTimerRef);
      setMessage(next);
      anim.stopAnimation();
      fadeSnackbar(anim, 1, SNACKBAR_FADE_IN_MS).start(() => {
        const hide = () => fadeSnackbar(anim, 0, SNACKBAR_FADE_OUT_MS).start(() => setMessage(null));
        hideTimerRef.current = setTimeout(hide, SNACKBAR_VISIBLE_MS);
      });
    },
    [anim]
  );

  useEffect(() => () => clearHideTimer(hideTimerRef), []);

  return { message, anim, show };
};
