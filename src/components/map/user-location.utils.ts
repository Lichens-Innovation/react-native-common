import * as Location from 'expo-location';
import type { LatLng, Region } from 'react-native-maps';

export interface UserLocationState {
  userLocation: LatLng | null;
  region: Region;
  isLoading: boolean;
  locationPermissionDenied: boolean;
  mapError: string | null;
}

export type UserLocationStateUpdate = (transition: (state: UserLocationState) => UserLocationState) => void;

export const INITIAL_USER_LOCATION_STATE: UserLocationState = {
  userLocation: null,
  region: { latitude: 37.78825, longitude: -122.4324, latitudeDelta: 0.001, longitudeDelta: 0.001 },
  isLoading: true,
  locationPermissionDenied: false,
  mapError: null,
};

const WATCH_POSITION_OPTIONS: Location.LocationOptions = {
  accuracy: Location.Accuracy.High,
  timeInterval: 5000,
  distanceInterval: 10,
};

export const startLoading = (state: UserLocationState): UserLocationState => ({
  ...state,
  isLoading: true,
  mapError: null,
  locationPermissionDenied: false,
});

export const stopLoading = (state: UserLocationState): UserLocationState => ({ ...state, isLoading: false });

const denyPermission = (state: UserLocationState): UserLocationState => ({
  ...state,
  locationPermissionDenied: true,
  isLoading: false,
});

export const failInitialization = (state: UserLocationState): UserLocationState => ({
  ...state,
  locationPermissionDenied: true,
  isLoading: false,
  mapError: 'Failed to initialize map',
});

const toLatLng = ({ latitude, longitude }: Location.LocationObjectCoords): LatLng => ({ latitude, longitude });

const ensureForegroundPermission = async () => {
  const { status } = await Location.getForegroundPermissionsAsync();
  if (status === 'granted') {
    return status;
  }

  const result = await Location.requestForegroundPermissionsAsync();
  return result.status;
};

const applyLastKnownPosition = async (signal: AbortSignal, update: UserLocationStateUpdate) => {
  const lastKnownPosition = await Location.getLastKnownPositionAsync({});
  if (signal.aborted || !lastKnownPosition) {
    return;
  }

  const coords = toLatLng(lastKnownPosition.coords);
  update((state) => ({ ...state, userLocation: coords, region: { ...state.region, ...coords }, isLoading: false }));
};

const watchUserPosition = (signal: AbortSignal, update: UserLocationStateUpdate) =>
  Location.watchPositionAsync(WATCH_POSITION_OPTIONS, (location) => {
    if (!signal.aborted) {
      update((state) => ({ ...state, userLocation: toLatLng(location.coords), isLoading: false }));
    }
  });

export const trackUserLocation = async (signal: AbortSignal, update: UserLocationStateUpdate) => {
  const status = await ensureForegroundPermission();
  if (signal.aborted) {
    update(stopLoading);
    return null;
  }

  if (status !== 'granted') {
    update(denyPermission);
  }

  await applyLastKnownPosition(signal, update);
  return watchUserPosition(signal, update);
};
