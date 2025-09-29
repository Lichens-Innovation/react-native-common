var __rest = (this && this.__rest) || function (s, e) {
    var t = {};
    for (var p in s) if (Object.prototype.hasOwnProperty.call(s, p) && e.indexOf(p) < 0)
        t[p] = s[p];
    if (s != null && typeof Object.getOwnPropertySymbols === "function")
        for (var i = 0, p = Object.getOwnPropertySymbols(s); i < p.length; i++) {
            if (e.indexOf(p[i]) < 0 && Object.prototype.propertyIsEnumerable.call(s, p[i]))
                t[p[i]] = s[p[i]];
        }
    return t;
};
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { Alert } from 'react-native';
import { useSnackbar } from '../../components/snack-bar/snackbar-provider';
import { logger } from '../../logger/logger';
import { getErrorMessage } from '../../utils/errors.utils';
import { WifiDiagnoseQueryKey } from './query-keys';
import { connectToWiFi, disconnectFromWiFi, fetchAvailableWifiList, fetchWifiInfo, isDisconnectedOrConnecting, isUnexpectedWifiConnectionError, } from './wifi-info.utils';
const REFRESH_INTERVAL = 30 * 1000;
const wifiInfoRetryStrategy = (failureCount, error) => {
    if (isDisconnectedOrConnecting(error) && failureCount < 3) {
        logger.info(`[useWifiInfo]: retrying, failureCount: ${failureCount}`);
        return true;
    }
    logger.info(`[useWifiInfo]: not retrying, failureCount: ${failureCount}`);
    return false;
};
export const useWifiInfo = () => {
    const _a = useQuery({
        queryKey: WifiDiagnoseQueryKey.details(),
        queryFn: fetchWifiInfo,
        refetchInterval: REFRESH_INTERVAL,
        retry: wifiInfoRetryStrategy,
        retryDelay: (failureCount) => failureCount * 1000,
    }), { data, isLoading, isFetching, isError, error } = _a, rest = __rest(_a, ["data", "isLoading", "isFetching", "isError", "error"]);
    return Object.assign({ wifiInfo: data, isLoadingWiFiInfos: isLoading, isFetchingWiFiInfos: isFetching, isErrorWiFiInfos: isError, errorWiFiInfos: error }, rest);
};
export const useLoadAvailableWifiList = () => {
    const _a = useQuery({
        queryKey: WifiDiagnoseQueryKey.list(),
        queryFn: fetchAvailableWifiList,
        refetchInterval: REFRESH_INTERVAL,
        retry: false,
    }), { data, isLoading, isFetching, isError, error } = _a, rest = __rest(_a, ["data", "isLoading", "isFetching", "isError", "error"]);
    return Object.assign({ availableNetworks: data !== null && data !== void 0 ? data : [], hasAvailableNetworks: !!(data === null || data === void 0 ? void 0 : data.length), isLoadingNetworks: isLoading, isFetchingNetworks: isFetching, isErrorNetworks: isError, errorNetworks: error }, rest);
};
export const useConnectToWifiMutation = () => {
    const queryClient = useQueryClient();
    const { t } = useTranslation();
    const _a = useMutation({
        mutationFn: connectToWiFi,
        onSuccess: () => queryClient.clear(),
        onError: (e) => {
            // Technical debt: investigate why isError and error are not properly set because we should be able to
            // display the error message directly on the component through a classic useEffect on isError and error
            const title = t('common:error');
            const message = t('common:wifi.connectError', { error: e === null || e === void 0 ? void 0 : e.message });
            Alert.alert(title, message);
        },
    }), { mutateAsync, isPending, isError, error, isSuccess } = _a, rest = __rest(_a, ["mutateAsync", "isPending", "isError", "error", "isSuccess"]);
    return Object.assign({ connectToWiFi: mutateAsync, isConnectingToWiFi: isPending, isErrorConnectingToWiFi: isError, errorConnectingToWiFi: error, isSuccessConnectingToWiFi: isSuccess }, rest);
};
export const useDisconnectFromWifiMutation = () => {
    const queryClient = useQueryClient();
    const _a = useMutation({
        mutationFn: disconnectFromWiFi,
        onSuccess: () => queryClient.clear(),
    }), { mutateAsync, isPending, isError, error, isSuccess } = _a, rest = __rest(_a, ["mutateAsync", "isPending", "isError", "error", "isSuccess"]);
    return Object.assign({ disconnectFromWiFi: mutateAsync, isDisconnectingFromWiFi: isPending, isErrorDisconnectingFromWiFi: isError, errorDisconnectingFromWiFi: error, isSuccessDisconnectingFromWiFi: isSuccess }, rest);
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
            const message = t('common:wifi.availableNetworksRetrievalError', { error: errorNetworks === null || errorNetworks === void 0 ? void 0 : errorNetworks.message });
            showSnackbarMessage(message);
        }
    }, [isErrorNetworks, errorNetworks, t, showSnackbarMessage]);
};
//# sourceMappingURL=use-wifi-info.js.map