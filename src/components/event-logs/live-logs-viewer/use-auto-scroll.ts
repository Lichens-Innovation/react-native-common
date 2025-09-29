import { LegendListRef } from '@legendapp/list';
import { useToggle } from '@uidotdev/usehooks';
import { useRef } from 'react';

export const useAutoScroll = <T>(shouldAutoScroll: boolean = false) => {
  const listRef = useRef<LegendListRef>(null);
  const [isAutoScrollEnabled, toggleAutoScroll] = useToggle(shouldAutoScroll);

  const scrollToBottom = (items: T[]) => {
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
