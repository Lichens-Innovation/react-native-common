import { useToggle } from '@uidotdev/usehooks';
import { useRef } from 'react';
export const useAutoScroll = (shouldAutoScroll = false) => {
    const listRef = useRef(null);
    const [isAutoScrollEnabled, toggleAutoScroll] = useToggle(shouldAutoScroll);
    const scrollToBottom = (items) => {
        if (!isAutoScrollEnabled || !listRef.current || !items.length) {
            return;
        }
        const lastItemIndex = items.length - 1;
        listRef.current.scrollToIndex({ index: lastItemIndex, animated: false, viewPosition: 1 });
    };
    return {
        listRef,
        scrollToBottom,
        isAutoScrollEnabled,
        toggleAutoScroll,
    };
};
//# sourceMappingURL=use-auto-scroll.js.map