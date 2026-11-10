import { BottomSheetModal } from '@gorhom/bottom-sheet';
import { RefObject, useCallback, useEffect, useRef, useState } from 'react';
import { BackHandler } from 'react-native';
import { logger } from '../../logger/logger';

interface UseDismissOnHardwareBackArgs {
  isOpen: boolean;
  modalRef: RefObject<BottomSheetModal | null>;
  dismiss: () => void;
}

const useDismissOnHardwareBack = ({ isOpen, modalRef, dismiss }: UseDismissOnHardwareBackArgs) => {
  useEffect(() => {
    if (!isOpen) return;

    const onBackButtonPress = (): boolean => {
      if (!modalRef.current) {
        return false;
      }

      logger.debug('[useBottomSheetToggler] onBackButtonPress: closing bottom sheet');
      dismiss();
      return true;
    };

    const backHandler = BackHandler.addEventListener('hardwareBackPress', onBackButtonPress);
    return () => backHandler.remove();
  }, [isOpen, modalRef, dismiss]);
};

export const useBottomSheetToggler = () => {
  const bottomSheetModalRef = useRef<BottomSheetModal>(null);
  const [isBottomSheetOpen, setIsBottomSheetOpen] = useState(false);

  const showBottomSheet = () => {
    setIsBottomSheetOpen(true);
    bottomSheetModalRef.current?.present();
  };

  const hideBottomSheet = useCallback(() => {
    logger.debug('[useBottomSheetToggler] hideBottomSheet');
    setIsBottomSheetOpen(false);
    bottomSheetModalRef.current?.dismiss();
  }, []);

  useDismissOnHardwareBack({ isOpen: isBottomSheetOpen, modalRef: bottomSheetModalRef, dismiss: hideBottomSheet });

  return {
    bottomSheetModalRef,
    showBottomSheet,
    hideBottomSheet,
    isBottomSheetOpen,
  };
};
