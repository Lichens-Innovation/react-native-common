import { LegendListRef } from '@legendapp/list';
export declare const useAutoScroll: <T>(shouldAutoScroll?: boolean) => {
    listRef: import("react").RefObject<LegendListRef>;
    scrollToBottom: (items: T[]) => void;
    isAutoScrollEnabled: boolean;
    toggleAutoScroll: (newValue?: boolean) => void;
};
