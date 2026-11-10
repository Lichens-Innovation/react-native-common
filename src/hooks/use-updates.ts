import { sleep } from '@lichens-innovation/ts-common';
import { nativeApplicationVersion, nativeBuildVersion } from 'expo-application';
import * as Updates from 'expo-updates';
import { useEffect, useState } from 'react';

import { logger } from '../logger/logger';
import { getDeviceType, isRealDevice } from '../utils/device/device.utils';
import { isProduction } from '../utils/device/env.utils.windows';

const checkForUpdateAsync = async (): Promise<void> => {
  const deviceType = getDeviceType();

  if (isRealDevice() && isProduction()) {
    logger.info(`[checkForUpdateAsync] Checking for update on ${deviceType}`);
    await Updates.checkForUpdateAsync();
    return;
  }

  logger.info(`[checkForUpdateAsync] Faking update check on ${deviceType}`);
  await sleep(1000);
};

const fetchUpdateSafely = async (): Promise<void> => {
  try {
    logger.info('[useUpdates.fetchAndApplyUpdate] Fetching update...');
    await Updates.fetchUpdateAsync();
    logger.info('[useUpdates.fetchAndApplyUpdate] Update fetched successfully');
  } catch (error) {
    // Almost always no connection to the update server; the user can simply try again: a warning, not a Sentry event (LICHENS-DISPATCH-MOBILE-1X). habit-hooks-disable non-essential-comment
    logger.warn('[useUpdates.fetchAndApplyUpdate] Failed to fetch update:', error);
  }
};

const checkForUpdatesSafely = async (): Promise<void> => {
  try {
    logger.info('[useUpdates.checkForUpdates] Checking for updates...');
    await checkForUpdateAsync();
    logger.info('[useUpdates.checkForUpdates] Updates checked successfully');
  } catch (error) {
    // An offline device cannot reach the update server and that is not a bug (LICHENS-DISPATCH-MOBILE-1X). habit-hooks-disable non-essential-comment
    logger.warn('[useUpdates.checkForUpdates] Failed to check for updates:', error);
  }
};

const reloadToApplyPendingUpdate = async (): Promise<void> => {
  try {
    logger.info('[useUpdates.useEffect] Reloading app...');
    await Updates.reloadAsync();
  } catch (error) {
    logger.error('[useUpdates.useEffect] Failed to reload app', error);
  }
};

const buildRunTypeMessage = (isEmbeddedLaunch: boolean): string => {
  const storeVersion = `Store version: ${nativeApplicationVersion} (${nativeBuildVersion})`;
  return isEmbeddedLaunch
    ? `${storeVersion}: from built-in code (no OTA update yet).`
    : `${storeVersion}: including OTA update.`;
};

export const useUpdates = () => {
  const [isLoading, setIsLoading] = useState(false);
  const { currentlyRunning, isUpdateAvailable, isUpdatePending } = Updates.useUpdates();

  const runWhileLoading = async (task: () => Promise<void>): Promise<void> => {
    setIsLoading(true);
    try {
      await task();
    } finally {
      setIsLoading(false);
    }
  };

  const fetchAndApplyUpdate = () => runWhileLoading(fetchUpdateSafely);
  const checkForUpdates = () => runWhileLoading(checkForUpdatesSafely);

  useEffect(() => {
    if (isUpdatePending) {
      void reloadToApplyPendingUpdate();
    }
  }, [isUpdatePending]);

  const runTypeMessage = buildRunTypeMessage(currentlyRunning.isEmbeddedLaunch);

  return {
    runTypeMessage,
    isUpdateAvailable,
    isUpdatePending,
    checkForUpdates,
    isLoading,
    fetchAndApplyUpdate,
  };
};
