import { isNullish } from '@lichens-innovation/ts-common';
import { MMKV } from 'react-native-mmkv';

const mmkvStorage = new MMKV();

const MMKV_PRIMITIVE_TYPES = ['boolean', 'number', 'string'];

const isMmkvPrimitive = (data: unknown): data is boolean | number | string =>
  MMKV_PRIMITIVE_TYPES.includes(typeof data);

const setItem = <T>(key: string, data: T) => {
  if (data instanceof ArrayBuffer) {
    mmkvStorage.set(key, data);
  } else if (isMmkvPrimitive(data)) {
    mmkvStorage.set(key, data);
  } else {
    mmkvStorage.set(key, JSON.stringify(data));
  }
};

const getItem = <T>(key: string, defaultValue: T): T => {
  if (defaultValue instanceof Uint8Array) {
    return (mmkvStorage.getBuffer(key) as T) ?? defaultValue;
  }
  if (typeof defaultValue === 'boolean') {
    return (mmkvStorage.getBoolean(key) as T) ?? defaultValue;
  }
  if (typeof defaultValue === 'number') {
    return (mmkvStorage.getNumber(key) as T) ?? defaultValue;
  }

  const stringValue = mmkvStorage.getString(key);
  if (isNullish(stringValue)) return defaultValue;

  if (typeof defaultValue === 'string') {
    return stringValue as T;
  }

  try {
    return JSON.parse(stringValue) as T;
  } catch {
    return stringValue as T;
  }
};

const removeItem = (key: string) => {
  mmkvStorage.delete(key);
};

export const storage = {
  setItem,
  getItem,
  removeItem,
};

export const mmkvStorageForMobxPersist = {
  setItem: (key: string, value: string): Promise<void> => {
    mmkvStorage.set(key, value);
    return Promise.resolve();
  },

  getItem: (key: string): Promise<string | null> => {
    const value = mmkvStorage.getString(key);
    return Promise.resolve(value ?? null);
  },

  removeItem: (key: string): Promise<void> => {
    mmkvStorage.delete(key);
    return Promise.resolve();
  },
};
