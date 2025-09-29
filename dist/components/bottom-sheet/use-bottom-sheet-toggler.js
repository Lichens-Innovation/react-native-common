import { useEffect, useRef, useState } from 'react';
import { BackHandler } from 'react-native';
import { logger } from '../../logger/logger';
export const useBottomSheetToggler = () => {
    const bottomSheetModalRef = useRef(null);
    const [isBottomSheetOpen, setIsBottomSheetOpen] = useState(false);
    const showBottomSheet = () => {
        var _a;
        setIsBottomSheetOpen(true);
        (_a = bottomSheetModalRef.current) === null || _a === void 0 ? void 0 : _a.present();
    };
    const hideBottomSheet = () => {
        var _a;
        logger.debug('[useBottomSheetToggler] hideBottomSheet');
        setIsBottomSheetOpen(false);
        (_a = bottomSheetModalRef.current) === null || _a === void 0 ? void 0 : _a.dismiss();
    };
    const onBackButtonPress = () => {
        if (!isBottomSheetOpen || !bottomSheetModalRef.current) {
            return false;
        }
        logger.debug('[useBottomSheetToggler] onBackButtonPress: closing bottom sheet');
        hideBottomSheet();
        return true;
    };
    useEffect(() => {
        if (!isBottomSheetOpen)
            return;
        const backHandler = BackHandler.addEventListener('hardwareBackPress', onBackButtonPress);
        return () => backHandler.remove();
    }, [isBottomSheetOpen]);
    return {
        bottomSheetModalRef,
        showBottomSheet,
        hideBottomSheet,
        isBottomSheetOpen,
    };
};
//# sourceMappingURL=use-bottom-sheet-toggler.js.map