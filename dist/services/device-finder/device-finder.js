import Zeroconf from 'react-native-zeroconf';
import { logger } from '../../logger/logger';
export class DeviceFinder {
    constructor() {
        this.type = '';
        this.protocol = '';
        this.domain = undefined;
        this.zeroConf = null;
        this.isScanning = false;
        this.timerID = undefined;
        this.discoveredDevices = [];
        this.onErrorCallback = () => { };
        this.onSuccessCallback = () => { };
    }
    scan(args) {
        const { type, protocol, domain, onError, onSuccess, timeoutMs } = args;
        this.type = type;
        this.protocol = protocol;
        this.domain = domain;
        this.onErrorCallback = onError;
        this.onSuccessCallback = onSuccess;
        this.start(timeoutMs);
    }
    setupListeners() {
        this.zeroConf = new Zeroconf();
        this.zeroConf.on('start', () => {
            logger.info('[DeviceFinder] Scan started');
            this.isScanning = true;
        });
        this.zeroConf.on('stop', () => {
            logger.info('[DeviceFinder] Scan stopped');
            this.isScanning = false;
        });
        this.zeroConf.on('resolved', (bonjourDevice) => this.onScanSuccess(bonjourDevice));
        this.zeroConf.on('error', (err) => this.onScanFailure(err));
    }
    onScanSuccess(bonjourDevice) {
        this.stop();
        logger.info('[DeviceFinder] Resolved bonjour device:', JSON.stringify(bonjourDevice, null, 2));
        if (this.discoveredDevices.some(({ name }) => name === bonjourDevice.name)) {
            logger.debug('[DeviceFinder] Resolved bonjour device already in list, skipping');
            return;
        }
        this.discoveredDevices.push(bonjourDevice);
        this.onSuccessCallback();
    }
    onScanFailure(error) {
        this.stop();
        // only log as info because we expect this to happen regularly (wrong network, etc.)
        logger.info('[DeviceFinder] Failed to scan for cameras:', error);
        this.onErrorCallback(error);
    }
    start(timeoutMs) {
        var _a;
        this.stop();
        try {
            this.setupListeners();
            logger.info('[DeviceFinder] Starting scan for ionodes-media');
            (_a = this.zeroConf) === null || _a === void 0 ? void 0 : _a.scan(this.type, this.protocol, this.domain);
            this.timerID = setTimeout(() => this.onScanFailure(new Error(`[DeviceFinder] timed out after ${timeoutMs}ms`)), timeoutMs);
        }
        catch (e) {
            this.onScanFailure(e);
        }
    }
    stop() {
        var _a;
        try {
            (_a = this.zeroConf) === null || _a === void 0 ? void 0 : _a.stop();
        }
        catch (e) {
            logger.error('[DeviceFinder] Error stopping scan:', e);
        }
        finally {
            this.reset();
        }
    }
    reset() {
        this.resetZeroConf();
        this.resetTimer();
        this.resetState();
    }
    resetZeroConf() {
        var _a;
        try {
            (_a = this.zeroConf) === null || _a === void 0 ? void 0 : _a.removeDeviceListeners();
        }
        catch (_b) {
            // ignore (nothing we can do at this point)
        }
        finally {
            this.zeroConf = null;
        }
    }
    resetTimer() {
        clearTimeout(this.timerID);
        this.timerID = undefined;
    }
    resetState() {
        this.discoveredDevices = [];
        this.isScanning = false;
    }
}
//# sourceMappingURL=device-finder.js.map