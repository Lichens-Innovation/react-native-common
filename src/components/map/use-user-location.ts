import { useEffect, useState, useRef, useCallback } from 'react';
import * as Location from 'expo-location';
import type { LatLng, Region } from 'react-native-maps';
import { getErrorMessage } from '@lichens-innovation/ts-common';
import { logger } from '../../logger';

const DEFAULT_REGION: Region = {
  latitude: 37.78825,
  longitude: -122.4324,
  latitudeDelta: 0.001,
  longitudeDelta: 0.001,
};

interface UseUserLocationResult {
  userLocation: LatLng | null;
  region: Region;
  isLoading: boolean;
  locationPermissionDenied: boolean;
  mapError: string | null;
  setRegion: (region: Region) => void;
  retry: () => void;
}

export function useUserLocation(): UseUserLocationResult {
  const [userLocation, setUserLocation] = useState<LatLng | null>(null);
  const [region, setRegion] = useState<Region>(DEFAULT_REGION);
  const [isLoading, setIsLoading] = useState(true);
  const [locationPermissionDenied, setLocationPermissionDenied] = useState(false);
  const [mapError, setMapError] = useState<string | null>(null);
  const locationSubscriptionRef = useRef<Location.LocationSubscription | null>(null);
  const abortControllerRef = useRef<AbortController | null>(null);

  const initializeLocation = useCallback(async () => {
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
    }
    const abortController = new AbortController();
    abortControllerRef.current = abortController;
    setIsLoading(true);
    setMapError(null);
    setLocationPermissionDenied(false);
    try {
      const currentStatus = await Location.getForegroundPermissionsAsync();
      let status = currentStatus.status;

      if (status !== 'granted') {
        const result = await Location.requestForegroundPermissionsAsync();
        status = result.status;
      }

      if (abortController.signal.aborted) {
        setIsLoading(false);
        return;
      }
      if (status !== 'granted') {
        setLocationPermissionDenied(true);
        setIsLoading(false);
      }

      const lastKnownPosition = await Location.getLastKnownPositionAsync({});
      if (!abortController.signal.aborted && lastKnownPosition) {
        setUserLocation({
          latitude: lastKnownPosition.coords.latitude,
          longitude: lastKnownPosition.coords.longitude,
        });
        setRegion((prev) => ({
          ...prev,
          latitude: lastKnownPosition.coords.latitude,
          longitude: lastKnownPosition.coords.longitude,
        }));
        setIsLoading(false);
      }

      const subscription = await Location.watchPositionAsync(
        {
          accuracy: Location.Accuracy.High,
          timeInterval: 5000,
          distanceInterval: 10,
        },
        (location) => {
          if (!abortController.signal.aborted) {
            setUserLocation({
              latitude: location.coords.latitude,
              longitude: location.coords.longitude,
            });
            setIsLoading(false);
          }
        },
      );
      locationSubscriptionRef.current = subscription;
    } catch (error) {
      setLocationPermissionDenied(true);
      setIsLoading(false);
      setMapError('Failed to initialize map');
      logger.error(`Error during user location initialization: ${getErrorMessage(error)}`);
    }
  }, []);

  useEffect(() => {
    initializeLocation();

    const timeout = setTimeout(() => {
      setIsLoading(false);
    }, 10000);

    return () => {
      clearTimeout(timeout);
      abortControllerRef.current?.abort();
      if (locationSubscriptionRef.current) {
        locationSubscriptionRef.current.remove();
        locationSubscriptionRef.current = null;
      }
    };
  }, [initializeLocation]);

  const setRegionSafe = useCallback((newRegion: Region) => {
    setRegion(newRegion);
  }, []);

  const retry = useCallback(() => {
    initializeLocation();
  }, [initializeLocation]);

  return {
    userLocation,
    region,
    isLoading,
    locationPermissionDenied,
    mapError,
    setRegion: setRegionSafe,
    retry,
  };
}
