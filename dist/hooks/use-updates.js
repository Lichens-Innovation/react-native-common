import { nativeApplicationVersion, nativeBuildVersion } from 'expo-application';
import * as Updates from 'expo-updates';
import { useEffect, useState } from 'react';
import { logger } from '../logger/logger';
import { getDeviceType, isRealDevice } from '../utils/device.utils';
import { sleep } from '../utils/thread.utils';
const checkForUpdateAsync = async () => {
    const deviceType = getDeviceType();
    if (isRealDevice()) {
        logger.info(`[checkForUpdateAsync] Checking for update on ${deviceType}`);
        await Updates.checkForUpdateAsync();
        return;
    }
    logger.info(`[checkForUpdateAsync] Faking update check on ${deviceType}`);
    await sleep(1000);
};
export const useUpdates = () => {
    const [isLoading, setIsLoading] = useState(false);
    const { currentlyRunning, isUpdateAvailable, isUpdatePending } = Updates.useUpdates();
    const fetchAndApplyUpdate = async () => {
        setIsLoading(true);
        try {
            logger.info('[useUpdates.fetchAndApplyUpdate] Fetching update...');
            await Updates.fetchUpdateAsync();
            logger.info('[useUpdates.fetchAndApplyUpdate] Update fetched successfully');
        }
        catch (error) {
            logger.error('[useUpdates.fetchAndApplyUpdate] Failed to fetch update:', error);
        }
        finally {
            setIsLoading(false);
        }
    };
    const checkForUpdates = async () => {
        setIsLoading(true);
        try {
            logger.info('[useUpdates.checkForUpdates] Checking for updates...');
            await checkForUpdateAsync();
            logger.info('[useUpdates.checkForUpdates] Updates checked successfully');
        }
        catch (error) {
            logger.error('[useUpdates.checkForUpdates] Failed to check for updates:', error);
        }
        finally {
            setIsLoading(false);
        }
    };
    useEffect(() => {
        if (isUpdatePending) {
            logger.info('[useUpdates.useEffect] Reloading app...');
            Updates.reloadAsync(); // update has successfully downloaded; apply it now
        }
    }, [isUpdatePending]);
    const storeVersion = `Store version: ${nativeApplicationVersion} (${nativeBuildVersion})`;
    const runTypeMessage = currentlyRunning.isEmbeddedLaunch
        ? `${storeVersion}: from built-in code (no OTA update yet).`
        : `${storeVersion}: including OTA update.`;
    return {
        runTypeMessage,
        isUpdateAvailable,
        isUpdatePending,
        checkForUpdates,
        isLoading,
        fetchAndApplyUpdate,
    };
};
//# sourceMappingURL=use-updates.js.map