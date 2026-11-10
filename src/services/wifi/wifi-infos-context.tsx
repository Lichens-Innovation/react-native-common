import { useQueryClient } from '@tanstack/react-query';
import { observer } from 'mobx-react-lite';
import { createContext, PropsWithChildren, useContext, useEffect, useRef } from 'react';
import { logger } from '../../logger/logger';
import { commonStore } from '../../store/store.index';
import { WifiDiagnoseQueryKey } from './query-keys';
import { useWifiInfo, useWifiInfosErrorSnackbar } from './use-wifi-info';

export type WifiInfosContextType = ReturnType<typeof useWifiInfo>;

export const WifiInfosContext = createContext<WifiInfosContextType | undefined>(undefined);

export const WifiInfosProvider = observer(({ children }: PropsWithChildren) => {
  const queryClient = useQueryClient();

  const value = useWifiInfo();
  useWifiInfosErrorSnackbar();

  // Read during render: observer re-renders on appStatus changes, and the effect re-runs on the new value. habit-hooks-disable non-essential-comment
  const appStatus = commonStore.appStatus;
  const prevAppStatusRef = useRef(appStatus);

  useEffect(() => {
    const newAppStatus = appStatus;
    const prevAppStatus = prevAppStatusRef.current;
    const hasChangedToActive = newAppStatus === 'active' && prevAppStatus !== 'active';
    if (hasChangedToActive) {
      logger.info('[WifiInfosProvider] App status changed to active, invalidating wifi infos queries');
      void queryClient.invalidateQueries({ queryKey: WifiDiagnoseQueryKey.details() });
    }

    prevAppStatusRef.current = newAppStatus;
  }, [queryClient, appStatus]);

  return <WifiInfosContext.Provider value={value}>{children}</WifiInfosContext.Provider>;
});

export const useWifiInfosContext = (): WifiInfosContextType => {
  const context = useContext(WifiInfosContext);

  if (context === undefined) {
    throw new Error('useWifiInfosContext must be used within a WifiInfosProvider');
  }

  return context;
};
