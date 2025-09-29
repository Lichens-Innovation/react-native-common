export declare const storage: {
    setItem: <T>(key: string, data: T) => void;
    getItem: <T>(key: string, defaultValue: T) => T;
    removeItem: (key: string) => void;
};
export declare const mmkvStorageForMobxPersist: {
    setItem: (key: string, value: string) => Promise<void>;
    getItem: (key: string) => Promise<string | null>;
    removeItem: (key: string) => Promise<void>;
};
