export declare const useUpdates: () => {
    runTypeMessage: string;
    isUpdateAvailable: boolean;
    isUpdatePending: boolean;
    checkForUpdates: () => Promise<void>;
    isLoading: boolean;
    fetchAndApplyUpdate: () => Promise<void>;
};
