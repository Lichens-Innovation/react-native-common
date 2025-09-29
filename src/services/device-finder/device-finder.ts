import Zeroconf from 'react-native-zeroconf';
import { logger } from '../../logger/logger';
import { DiscoveredDevice } from './device-finder.types';

interface DeviceFinderScanArgs {
  type: string;
  protocol: string;
  domain?: string;

  onError: (error: Error) => void;
  onSuccess: () => void;
  timeoutMs: number;
}

export class DeviceFinder {
  private type: string = '';
  private protocol: string = '';
  private domain: string | undefined = undefined;

  private zeroConf: Zeroconf | null = null;
  public isScanning: boolean = false;
  private timerID: NodeJS.Timeout | undefined = undefined;
  public discoveredDevices: DiscoveredDevice[] = [];

  private onErrorCallback: (error: Error) => void = () => {};
  private onSuccessCallback: () => void = () => {};

  public scan(args: DeviceFinderScanArgs) {
    const { type, protocol, domain, onError, onSuccess, timeoutMs } = args;

    this.type = type;
    this.protocol = protocol;
    this.domain = domain;

    this.onErrorCallback = onError;
    this.onSuccessCallback = onSuccess;
    this.start(timeoutMs);
  }

  private setupListeners() {
    this.zeroConf = new Zeroconf();

    this.zeroConf.on('start', () => {
      logger.info('[DeviceFinder] Scan started');
      this.isScanning = true;
    });

    this.zeroConf.on('stop', () => {
      logger.info('[DeviceFinder] Scan stopped');
      this.isScanning = false;
    });

    this.zeroConf.on('resolved', (bonjourDevice: DiscoveredDevice) => this.onScanSuccess(bonjourDevice));
    this.zeroConf.on('error', (err: Error) => this.onScanFailure(err));
  }

  private onScanSuccess(bonjourDevice: DiscoveredDevice) {
    this.stop();

    logger.info('[DeviceFinder] Resolved bonjour device:', JSON.stringify(bonjourDevice, null, 2));
    if (this.discoveredDevices.some(({ name }) => name === bonjourDevice.name)) {
      logger.debug('[DeviceFinder] Resolved bonjour device already in list, skipping');
      return;
    }

    this.discoveredDevices.push(bonjourDevice);

    this.onSuccessCallback();
  }

  private onScanFailure(error: Error) {
    this.stop();
    // only log as info because we expect this to happen regularly (wrong network, etc.)
    logger.info('[DeviceFinder] Failed to scan for cameras:', error);
    this.onErrorCallback(error);
  }

  private start(timeoutMs: number) {
    this.stop();

    try {
      this.setupListeners();

      logger.info('[DeviceFinder] Starting scan for ionodes-media');
      this.zeroConf?.scan(this.type, this.protocol, this.domain);

      this.timerID = setTimeout(
        () => this.onScanFailure(new Error(`[DeviceFinder] timed out after ${timeoutMs}ms`)),
        timeoutMs
      );
    } catch (e: any) {
      this.onScanFailure(e);
    }
  }

  private stop() {
    try {
      this.zeroConf?.stop();
    } catch (e) {
      logger.error('[DeviceFinder] Error stopping scan:', e);
    } finally {
      this.reset();
    }
  }

  private reset() {
    this.resetZeroConf();
    this.resetTimer();
    this.resetState();
  }

  private resetZeroConf() {
    try {
      this.zeroConf?.removeDeviceListeners();
    } catch {
      // ignore (nothing we can do at this point)
    } finally {
      this.zeroConf = null;
    }
  }

  private resetTimer() {
    clearTimeout(this.timerID);
    this.timerID = undefined;
  }

  private resetState() {
    this.discoveredDevices = [];
    this.isScanning = false;
  }
}
