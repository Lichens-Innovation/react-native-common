import { getErrorMessage } from '@lichens-innovation/ts-common';
import type * as Location from 'expo-location';
import { type RefObject, useCallback, useEffect, useRef, useState } from 'react';
import type { Region } from 'react-native-maps';
import { logger } from '../../logger/logger.index';
import {
  failInitialization,
  INITIAL_USER_LOCATION_STATE,
  startLoading,
  stopLoading,
  trackUserLocation,
  type UserLocationState,
  type UserLocationStateUpdate,
} from './user-location.utils';

const LOADING_TIMEOUT_MS = 10000;

interface UseUserLocationResult extends UserLocationState {
  setRegion: (region: Region) => void;
  retry: () => void;
}

interface RestartLocationTrackingArgs {
  abortControllerRef: RefObject<AbortController | null>;
  subscriptionRef: RefObject<Location.LocationSubscription | null>;
  update: UserLocationStateUpdate;
}

const restartLocationTracking = async ({
  abortControllerRef,
  subscriptionRef,
  update,
}: RestartLocationTrackingArgs) => {
  abortControllerRef.current?.abort();
  const abortController = new AbortController();
  abortControllerRef.current = abortController;
  update(startLoading);

  try {
    const subscription = await trackUserLocation(abortController.signal, update);
    if (subscription) {
      subscriptionRef.current = subscription;
    }
  } catch (error) {
    update(failInitialization);
    logger.error(`Error during user location initialization: ${getErrorMessage(error)}`);
  }
};

export const useUserLocation = (): UseUserLocationResult => {
  const [state, setState] = useState<UserLocationState>(INITIAL_USER_LOCATION_STATE);
  const subscriptionRef = useRef<Location.LocationSubscription | null>(null);
  const abortControllerRef = useRef<AbortController | null>(null);

  const initializeLocation = useCallback(
    () => restartLocationTracking({ abortControllerRef, subscriptionRef, update: setState }),
    []
  );

  useEffect(() => {
    void initializeLocation();
    const timeout = setTimeout(() => setState(stopLoading), LOADING_TIMEOUT_MS);

    return () => {
      clearTimeout(timeout);
      abortControllerRef.current?.abort();
      subscriptionRef.current?.remove();
      subscriptionRef.current = null;
    };
  }, [initializeLocation]);

  const setRegion = useCallback((region: Region) => setState((previous) => ({ ...previous, region })), []);
  const retry = useCallback(() => void initializeLocation(), [initializeLocation]);

  return { ...state, setRegion, retry };
};
