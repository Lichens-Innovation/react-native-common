import { BottomSheetModal } from '@gorhom/bottom-sheet';
import { useEffect, useRef, useState } from 'react';
import { BackHandler } from 'react-native';
import { logger } from '../../logger/logger';

export const useBottomSheetToggler = () => {
  const bottomSheetModalRef = useRef<BottomSheetModal>(null);
  const [isBottomSheetOpen, setIsBottomSheetOpen] = useState(false);

  const showBottomSheet = () => {
    setIsBottomSheetOpen(true);
    bottomSheetModalRef.current?.present();
  };

  const hideBottomSheet = () => {
    logger.debug('[useBottomSheetToggler] hideBottomSheet');
    setIsBottomSheetOpen(false);
    bottomSheetModalRef.current?.dismiss();
  };

  const onBackButtonPress = (): boolean => {
    if (!isBottomSheetOpen || !bottomSheetModalRef.current) {
      return false;
    }

    logger.debug('[useBottomSheetToggler] onBackButtonPress: closing bottom sheet');
    hideBottomSheet();
    return true;
  };

  useEffect(() => {
    if (!isBottomSheetOpen) return;

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
