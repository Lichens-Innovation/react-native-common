import { getErrorMessage } from '@lichens-innovation/ts-common';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { Alert } from 'react-native';

import { useSnackbar } from '../../components/snack-bar/snackbar-provider';
import { logger } from '../../logger/logger';
import { WifiDiagnoseQueryKey } from './query-keys';
import {
  connectToWiFi,
  disconnectFromWiFi,
  fetchAvailableWifiList,
  fetchWifiInfo,
  isDisconnectedOrConnecting,
  isUnexpectedWifiConnectionError,
} from './wifi-info.utils';

const REFRESH_INTERVAL = 30 * 1000;

const wifiInfoRetryStrategy = (failureCount: number, error: unknown) => {
  if (isDisconnectedOrConnecting(error) && failureCount < 3) {
    logger.info(`[useWifiInfo]: retrying, failureCount: ${failureCount}`);
    return true;
  }

  logger.info(`[useWifiInfo]: not retrying, failureCount: ${failureCount}`);
  return false;
};

export const useWifiInfo = () => {
  const { data, isLoading, isFetching, isError, error, ...rest } = useQuery({
    queryKey: WifiDiagnoseQueryKey.details(),
    queryFn: fetchWifiInfo,
    refetchInterval: REFRESH_INTERVAL,
    retry: wifiInfoRetryStrategy,
    retryDelay: (failureCount) => failureCount * 1000,
  });

  return {
    wifiInfo: data,
    isLoadingWiFiInfos: isLoading,
    isFetchingWiFiInfos: isFetching,
    isErrorWiFiInfos: isError,
    errorWiFiInfos: error,
    ...rest,
  };
};

export const useLoadAvailableWifiList = () => {
  const { data, isLoading, isFetching, isError, error, ...rest } = useQuery({
    queryKey: WifiDiagnoseQueryKey.list(),
    queryFn: fetchAvailableWifiList,
    refetchInterval: REFRESH_INTERVAL,
    retry: false,
  });

  return {
    availableNetworks: data ?? [],
    hasAvailableNetworks: !!data?.length,
    isLoadingNetworks: isLoading,
    isFetchingNetworks: isFetching,
    isErrorNetworks: isError,
    errorNetworks: error,
    ...rest,
  };
};

export const useConnectToWifiMutation = () => {
  const queryClient = useQueryClient();
  const { t } = useTranslation();

  const { mutateAsync, isPending, isError, error, isSuccess, ...rest } = useMutation({
    mutationFn: connectToWiFi,
    onSuccess: () => queryClient.clear(),
    onError: (e: Error) => {
      // Technical debt: investigate why isError and error are not properly set because we should be able to
      // display the error message directly on the component through a classic useEffect on isError and error
      const title = t('common:error');
      const message = t('common:wifi.connectError', { error: e?.message });
      Alert.alert(title, message);
    },
  });

  return {
    connectToWiFi: mutateAsync,
    isConnectingToWiFi: isPending,
    isErrorConnectingToWiFi: isError,
    errorConnectingToWiFi: error,
    isSuccessConnectingToWiFi: isSuccess,
    ...rest,
  };
};

export const useDisconnectFromWifiMutation = () => {
  const queryClient = useQueryClient();

  const { mutateAsync, isPending, isError, error, isSuccess, ...rest } = useMutation({
    mutationFn: disconnectFromWiFi,
    onSuccess: () => queryClient.clear(),
  });

  return {
    disconnectFromWiFi: mutateAsync,
    isDisconnectingFromWiFi: isPending,
    isErrorDisconnectingFromWiFi: isError,
    errorDisconnectingFromWiFi: error,
    isSuccessDisconnectingFromWiFi: isSuccess,
    ...rest,
  };
};

export const useWifiInfosErrorSnackbar = () => {
  const { t } = useTranslation();
  const { showSnackbarMessage } = useSnackbar();

  const { errorWiFiInfos } = useWifiInfo();

  useEffect(() => {
    if (isUnexpectedWifiConnectionError(errorWiFiInfos)) {
      const message = t('common:wifi.currentNetworkRetrievalError', { error: getErrorMessage(errorWiFiInfos) });
      showSnackbarMessage(message);
    }
  }, [errorWiFiInfos, t, showSnackbarMessage]);
};

export const useLoadAvailableWifiListErrorSnackbar = () => {
  const { t } = useTranslation();
  const { showSnackbarMessage } = useSnackbar();

  const { isErrorNetworks, errorNetworks } = useLoadAvailableWifiList();

  useEffect(() => {
    if (isErrorNetworks) {
      const message = t('common:wifi.availableNetworksRetrievalError', { error: errorNetworks?.message });
      showSnackbarMessage(message);
    }
  }, [isErrorNetworks, errorNetworks, t, showSnackbarMessage]);
};
