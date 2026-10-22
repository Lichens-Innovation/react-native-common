import * as Location from 'expo-location';
import { logger } from '../logger/logger';

/** Longest a photo taken in the app waits for a GPS fix before it is kept without a position. */
export const CAPTURE_POSITION_TIMEOUT_MS = 10_000;

/** A tracked fix older than this is not the device's current position anymore; the photo waits for a new one. */
export const FRESH_POSITION_MAX_AGE_MS = 30_000;

/**
 * Shows the system location prompt only when the user has never answered it. A refusal is final here: the
 * camera keeps working, its photos just carry no position.
 */
export async function requestLocationPermissionIfUndetermined(): Promise<void> {
  try {
    const permission = await Location.getForegroundPermissionsAsync();
    if (permission.status !== Location.PermissionStatus.UNDETERMINED || !permission.canAskAgain) return;
    await Location.requestForegroundPermissionsAsync();
  } catch (error) {
    logger.warn('Failed to request the location permission:', error);
  }
}

export interface PositionTracker {
  /**
   * The device position for a photo taken now: the latest tracked fix when it is fresh, otherwise the next fix,
   * or null when none arrives within `timeoutMs`, location is not granted, or tracking was stopped.
   * Never rejects.
   */
  positionForCapture(timeoutMs?: number): Promise<Location.LocationObject | null>;
  /** Stops the GPS; photos still waiting for a fix get null. */
  stop(): void;
}

type FixWaiter = (position: Location.LocationObject | null) => void;

/**
 * Keeps the GPS running while the camera is open, so a photo takes the position already known instead of
 * asking the GPS for a new fix per shot, which takes seconds. Asks for the permission first if the user never
 * answered. A photo waits only when no fresh fix is known: before the first one, or once the last one is stale.
 */
export function startPositionTracking(): PositionTracker {
  let latest: Location.LocationObject | null = null;
  let stopped = false;
  let subscription: Location.LocationSubscription | null = null;
  const waiters = new Set<FixWaiter>();

  const settleWaiters = (position: Location.LocationObject | null) => {
    [...waiters].forEach((waiter) => waiter(position));
  };

  const isFresh = (position: Location.LocationObject) => Date.now() - position.timestamp <= FRESH_POSITION_MAX_AGE_MS;

  // The first update of a watch can be the OS's cached last location, hours old: a waiting photo takes only a
  // fresh fix and keeps waiting otherwise.
  const onFix = (position: Location.LocationObject) => {
    latest = position;
    if (isFresh(position)) settleWaiters(position);
  };

  const watch = async () => {
    try {
      await requestLocationPermissionIfUndetermined();
      const permission = await Location.getForegroundPermissionsAsync();
      if (!permission.granted || stopped) return;
      // No distance filter: standing still must keep the fix fresh, or the next photo would wait for nothing.
      const watcher = await Location.watchPositionAsync(
        { accuracy: Location.Accuracy.High, timeInterval: 5_000, distanceInterval: 0 },
        onFix
      );
      if (stopped) watcher.remove();
      else subscription = watcher;
    } catch (error) {
      logger.warn('Failed to track the position for photos:', error);
    }
  };
  watch();

  const waitForFix = (timeoutMs: number) =>
    new Promise<Location.LocationObject | null>((resolve) => {
      const settle: FixWaiter = (position) => {
        clearTimeout(timer);
        waiters.delete(settle);
        resolve(position);
      };
      const timer = setTimeout(() => settle(null), timeoutMs);
      waiters.add(settle);
    });

  return {
    positionForCapture: (timeoutMs = CAPTURE_POSITION_TIMEOUT_MS) => {
      if (latest && isFresh(latest)) return Promise.resolve(latest);
      if (stopped) return Promise.resolve(null);
      return waitForFix(timeoutMs);
    },
    stop: () => {
      stopped = true;
      subscription?.remove();
      subscription = null;
      settleWaiters(null);
    },
  };
}
