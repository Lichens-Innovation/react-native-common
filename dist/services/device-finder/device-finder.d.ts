import { DiscoveredDevice } from './device-finder.types';
interface DeviceFinderScanArgs {
    type: string;
    protocol: string;
    domain?: string;
    onError: (error: Error) => void;
    onSuccess: () => void;
    timeoutMs: number;
}
export declare class DeviceFinder {
    private type;
    private protocol;
    private domain;
    private zeroConf;
    isScanning: boolean;
    private timerID;
    discoveredDevices: DiscoveredDevice[];
    private onErrorCallback;
    private onSuccessCallback;
    scan(args: DeviceFinderScanArgs): void;
    private setupListeners;
    private onScanSuccess;
    private onScanFailure;
    private start;
    private stop;
    private reset;
    private resetZeroConf;
    private resetTimer;
    private resetState;
}
export {};
