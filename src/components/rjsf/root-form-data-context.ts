import { createContext, useContext } from 'react';

export const RootFormDataContext = createContext<Record<string, unknown> | undefined>(undefined);

export const useRootFormData = (): Record<string, unknown> | undefined => useContext(RootFormDataContext);
