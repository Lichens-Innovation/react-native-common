import { useEffect, useRef, useState } from 'react';
import { LiveRootFormDataStore } from './live-root-form-data-store';

type FormDataRecord = Record<string, unknown>;

export const useLiveRootFormDataStore = (formData?: FormDataRecord): LiveRootFormDataStore => {
  const [store] = useState<LiveRootFormDataStore>(() => new LiveRootFormDataStore(formData));
  // Starts at the mount prop, so seeding is a no-op until the caller passes a genuinely new formData. habit-hooks-disable non-essential-comment
  const seededRef = useRef<FormDataRecord | undefined>(formData);

  useEffect(() => {
    if (seededRef.current === formData) return;

    seededRef.current = formData;
    store.reseed(formData);
  }, [formData, store]);

  return store;
};
