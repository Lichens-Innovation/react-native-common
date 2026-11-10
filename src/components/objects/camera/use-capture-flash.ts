import { useCallback, useState } from 'react';
import { Animated } from 'react-native';

const FLASH_DURATION_MS = 180;

interface CaptureFlash {
  flashAnim: Animated.Value;
  triggerCaptureFlash: () => void;
}

export const useCaptureFlash = (): CaptureFlash => {
  const [flashAnim] = useState(() => new Animated.Value(0));

  const triggerCaptureFlash = useCallback(() => {
    flashAnim.stopAnimation();
    flashAnim.setValue(1);
    Animated.timing(flashAnim, { toValue: 0, duration: FLASH_DURATION_MS, useNativeDriver: true }).start();
  }, [flashAnim]);

  return { flashAnim, triggerCaptureFlash };
};
