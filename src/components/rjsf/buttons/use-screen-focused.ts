import { NavigationContext } from 'expo-router/react-navigation';
import { useCallback, useContext, useSyncExternalStore } from 'react';

export const useScreenFocused = (): boolean => {
  const navigation = useContext(NavigationContext);

  const subscribe = useCallback(
    (onStoreChange: () => void) => {
      if (!navigation) return () => {};
      const unsubFocus = navigation.addListener('focus', onStoreChange);
      const unsubBlur = navigation.addListener('blur', onStoreChange);
      return () => {
        unsubFocus();
        unsubBlur();
      };
    },
    [navigation]
  );

  return useSyncExternalStore(subscribe, () => navigation?.isFocused() ?? true);
};
