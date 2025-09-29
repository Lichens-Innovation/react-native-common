declare class CommonStore {
    isDarkMode: boolean;
    constructor();
    toggleDarkMode(): void;
    setIsDarkMode(isDarkMode: boolean): void;
}
export declare const commonStore: CommonStore;
export {};
