import { NavigationContext } from 'expo-router/react-navigation';
import { useContext, useEffect, useState } from 'react';

export const useScreenFocused = (): boolean => {
  const navigation = useContext(NavigationContext);
  const [focused, setFocused] = useState<boolean>(() => navigation?.isFocused() ?? true);

  useEffect(() => {
    if (!navigation) return;
    setFocused(navigation.isFocused());
    const unsubFocus = navigation.addListener('focus', () => setFocused(true));
    const unsubBlur = navigation.addListener('blur', () => setFocused(false));
    return () => {
      unsubFocus();
      unsubBlur();
    };
  }, [navigation]);

  return focused;
};
