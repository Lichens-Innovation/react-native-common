import { DiscoveredDevice } from './device-finder.types';
interface DeviceFinderConstructorArgs {
    onError: (error: Error) => void;
    onSuccess: () => void;
}
export declare class DeviceFinder {
    private static INSTANCE;
    isScanning: boolean;
    discoveredDevices: DiscoveredDevice[];
    private onErrorCallback;
    private onSuccessCallback;
    private constructor();
    static getInstance(args: DeviceFinderConstructorArgs): DeviceFinder;
    private setupListeners;
    start(): void;
    stop(): void;
}
export {};
