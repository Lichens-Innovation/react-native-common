import { logger } from '../../logger/logger';
import { notImplementedYet } from '../../utils/platform.utils';
export class DeviceFinder {
    constructor(args) {
        this.isScanning = false;
        this.discoveredDevices = [];
        const { onError, onSuccess } = args;
        this.onErrorCallback = onError;
        this.onSuccessCallback = onSuccess;
        this.setupListeners();
    }
    static getInstance(args) {
        if (!DeviceFinder.INSTANCE) {
            DeviceFinder.INSTANCE = new DeviceFinder(args);
        }
        return DeviceFinder.INSTANCE;
    }
    setupListeners() {
        notImplementedYet('DeviceFinder.setupListeners');
    }
    start() {
        if (this.isScanning) {
            logger.warn('[DeviceFinder] Scan already in progress');
            return;
        }
        try {
            logger.info('[DeviceFinder] Starting scan for ionodes-media');
            notImplementedYet('DeviceFinder.start');
        }
        catch (e) {
            logger.error('[DeviceFinder] Error starting scan:', e);
            this.onErrorCallback(e);
        }
    }
    stop() {
        if (!this.isScanning) {
            return;
        }
        try {
            notImplementedYet('DeviceFinder.stop');
        }
        catch (e) {
            logger.error('[DeviceFinder] Error stopping scan:', e);
            this.onErrorCallback(e instanceof Error ? e : new Error(String(e)));
        }
    }
}
//# sourceMappingURL=device-finder.windows.js.map