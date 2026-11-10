import { useEffect, useEffectEvent, useRef } from 'react';
import { VolumeManager } from 'react-native-volume-manager';
import { logger } from '../../../logger/logger';

const MIN_VOLUME = 0.1;
const MAX_VOLUME = 0.9;
const TRIGGER_THROTTLE_MS = 2000;

const clampInitialVolume = async (): Promise<void> => {
  try {
    const { volume } = await VolumeManager.getVolume();
    const clampedVolume = Math.min(Math.max(volume, MIN_VOLUME), MAX_VOLUME);
    if (clampedVolume !== volume) {
      await VolumeManager.setVolume(clampedVolume, { showUI: false });
    }
  } catch (e) {
    logger.warn('Failed to clamp volume', e);
  }
};

export const useVolumeShutter = (onPress: () => void): void => {
  const lastTriggerAtRef = useRef(0);
  const handleVolumePress = useEffectEvent(onPress);

  useEffect(() => {
    void clampInitialVolume();
    const subscription = VolumeManager.addVolumeListener(() => {
      const now = Date.now();
      if (now - lastTriggerAtRef.current < TRIGGER_THROTTLE_MS) return;
      lastTriggerAtRef.current = now;
      handleVolumePress();
    });
    return () => {
      subscription?.remove?.();
    };
  }, []);
};
