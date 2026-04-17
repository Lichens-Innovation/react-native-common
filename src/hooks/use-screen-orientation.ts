import * as ScreenOrientation from 'expo-screen-orientation';
import { useEffect, useState } from 'react';
import { logger } from '../logger/logger';
import { useIsLandscape } from './use-window-orientation';

export const useScreenOrientation = () => {
  const isLandscape = useIsLandscape();
  const [orientation, setOrientation] = useState<ScreenOrientation.Orientation>(ScreenOrientation.Orientation.UNKNOWN);

  useEffect(() => {
    const listener = ScreenOrientation.addOrientationChangeListener((event) => {
      const value = event.orientationInfo.orientation;
      setOrientation(value);
      logger.debug(`[useScreenOrientation] device orientation changed to ${value}`);
    });

    return () => listener.remove();
  }, []);

  const isLandscapeLeft = orientation === ScreenOrientation.Orientation.LANDSCAPE_LEFT;
  const isLandscapeRight = orientation === ScreenOrientation.Orientation.LANDSCAPE_RIGHT;

  const isPortraitUp = orientation === ScreenOrientation.Orientation.PORTRAIT_UP;
  const isPortraitDown = orientation === ScreenOrientation.Orientation.PORTRAIT_DOWN;
  const isPortrait = !isLandscape;

  return {
    orientation,

    isLandscape,
    isLandscapeLeft,
    isLandscapeRight,

    isPortrait,
    isPortraitUp,
    isPortraitDown,
  };
};
