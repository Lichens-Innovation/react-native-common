import { logger } from '../../logger/logger';
import { notImplementedYet } from '../../utils/platform.utils';
import { DiscoveredDevice } from './device-finder.types';

interface DeviceFinderConstructorArgs {
  onError: (error: Error) => void;
  onSuccess: () => void;
}

export class DeviceFinder {
  private static INSTANCE: DeviceFinder;

  public isScanning: boolean = false;
  public discoveredDevices: DiscoveredDevice[] = [];

  private onErrorCallback: (error: Error) => void;
  private onSuccessCallback: () => void;

  private constructor(args: DeviceFinderConstructorArgs) {
    const { onError, onSuccess } = args;

    this.onErrorCallback = onError;
    this.onSuccessCallback = onSuccess;

    this.setupListeners();
  }

  public static getInstance(args: DeviceFinderConstructorArgs): DeviceFinder {
    if (!DeviceFinder.INSTANCE) {
      DeviceFinder.INSTANCE = new DeviceFinder(args);
    }

    return DeviceFinder.INSTANCE;
  }

  private setupListeners() {
    notImplementedYet('DeviceFinder.setupListeners');
  }

  public start() {
    if (this.isScanning) {
      logger.warn('[DeviceFinder] Scan already in progress');
      return;
    }

    try {
      logger.info('[DeviceFinder] Starting scan for ionodes-media');
      notImplementedYet('DeviceFinder.start');
    } catch (e: any) {
      logger.error('[DeviceFinder] Error starting scan:', e);
      this.onErrorCallback(e);
    }
  }

  public stop() {
    if (!this.isScanning) {
      return;
    }

    try {
      notImplementedYet('DeviceFinder.stop');
    } catch (e) {
      logger.error('[DeviceFinder] Error stopping scan:', e);
      this.onErrorCallback(e instanceof Error ? e : new Error(String(e)));
    }
  }
}
