import { MMKV } from 'react-native-mmkv';
const mmkvStorage = new MMKV();
const setItem = (key, data) => {
    if (data instanceof ArrayBuffer) {
        mmkvStorage.set(key, data);
    }
    else if (typeof data === 'boolean' || typeof data === 'number' || typeof data === 'string') {
        mmkvStorage.set(key, data);
    }
    else {
        mmkvStorage.set(key, JSON.stringify(data));
    }
};
const getItem = (key, defaultValue) => {
    var _a, _b, _c;
    if (defaultValue instanceof Uint8Array) {
        return (_a = mmkvStorage.getBuffer(key)) !== null && _a !== void 0 ? _a : defaultValue;
    }
    if (typeof defaultValue === 'boolean') {
        return (_b = mmkvStorage.getBoolean(key)) !== null && _b !== void 0 ? _b : defaultValue;
    }
    if (typeof defaultValue === 'number') {
        return (_c = mmkvStorage.getNumber(key)) !== null && _c !== void 0 ? _c : defaultValue;
    }
    const stringValue = mmkvStorage.getString(key);
    if (stringValue === undefined || stringValue === null)
        return defaultValue;
    if (typeof defaultValue === 'string') {
        return stringValue;
    }
    try {
        return JSON.parse(stringValue);
    }
    catch (_d) {
        return stringValue;
    }
};
const removeItem = (key) => {
    mmkvStorage.delete(key);
};
export const storage = {
    setItem,
    getItem,
    removeItem,
};
export const mmkvStorageForMobxPersist = {
    setItem: (key, value) => {
        mmkvStorage.set(key, value);
        return Promise.resolve();
    },
    getItem: (key) => {
        const value = mmkvStorage.getString(key);
        return Promise.resolve(value !== null && value !== void 0 ? value : null);
    },
    removeItem: (key) => {
        mmkvStorage.delete(key);
        return Promise.resolve();
    },
};
//# sourceMappingURL=storage.js.map