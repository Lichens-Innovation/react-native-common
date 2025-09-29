import { BottomSheetModal } from '@gorhom/bottom-sheet';
export declare const useBottomSheetToggler: () => {
    bottomSheetModalRef: import("react").RefObject<BottomSheetModal>;
    showBottomSheet: () => void;
    hideBottomSheet: () => void;
    isBottomSheetOpen: boolean;
};
