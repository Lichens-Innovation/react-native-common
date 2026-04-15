import * as ScreenOrientation from 'expo-screen-orientation';
import { useEffect, useState } from 'react';
import { logger } from '../logger/logger';

export const useScreenOrientation = () => {
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
  const isLandscape = isLandscapeLeft || isLandscapeRight;

  const isPortraitUp = orientation === ScreenOrientation.Orientation.PORTRAIT_UP;
  const isPortraitDown = orientation === ScreenOrientation.Orientation.PORTRAIT_DOWN;
  const isPortrait = isPortraitUp || isPortraitDown;

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
