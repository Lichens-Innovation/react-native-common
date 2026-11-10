import { isNullish } from '@lichens-innovation/ts-common';

const nativeStorage = new Map<string, string>();

const setItem = <T>(key: string, data: T) => {
  nativeStorage.set(key, JSON.stringify(data));
};

const getItem = <T>(key: string, defaultValue: T): T => {
  const stringValue = nativeStorage.get(key);
  if (isNullish(stringValue)) return defaultValue;

  return JSON.parse(stringValue) as T;
};

const removeItem = (key: string) => {
  nativeStorage.delete(key);
};

export const storage = {
  setItem,
  getItem,
  removeItem,
};

export const mmkvStorageForMobxPersist = {
  setItem: (key: string, value: string): Promise<void> => {
    nativeStorage.set(key, value);
    return Promise.resolve();
  },

  getItem: (key: string): Promise<string | null> => {
    const value = nativeStorage.get(key);
    return Promise.resolve(value ?? null);
  },

  removeItem: (key: string): Promise<void> => {
    nativeStorage.delete(key);
    return Promise.resolve();
  },
};
