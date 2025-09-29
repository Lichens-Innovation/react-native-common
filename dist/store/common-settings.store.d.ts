declare class CommonSettingsStore {
    lastKnownCameraIP: string;
    ionodesAdminPassword: string;
    constructor();
    setLastKnownCameraIP(ip: string): void;
    get hasIonodesAdminPassword(): boolean;
    setIonodesAdminPassword(password: string): void;
}
export declare const commonSettingsStore: CommonSettingsStore;
export {};
