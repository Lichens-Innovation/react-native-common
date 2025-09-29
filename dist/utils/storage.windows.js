import { isNullish } from './types.utils';
const nativeStorage = new Map();
const setItem = (key, data) => {
    nativeStorage.set(key, JSON.stringify(data));
};
const getItem = (key, defaultValue) => {
    const stringValue = nativeStorage.get(key);
    if (isNullish(stringValue))
        return defaultValue;
    return JSON.parse(stringValue);
};
const removeItem = (key) => {
    nativeStorage.delete(key);
};
export const storage = {
    setItem,
    getItem,
    removeItem,
};
export const mmkvStorageForMobxPersist = {
    setItem: (key, value) => {
        nativeStorage.set(key, value);
        return Promise.resolve();
    },
    getItem: (key) => {
        const value = nativeStorage.get(key);
        return Promise.resolve(value !== null && value !== void 0 ? value : null);
    },
    removeItem: (key) => {
        nativeStorage.delete(key);
        return Promise.resolve();
    },
};
//# sourceMappingURL=storage.windows.js.map