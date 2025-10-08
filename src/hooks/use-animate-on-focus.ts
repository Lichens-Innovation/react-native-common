import { useFocusEffect, useNavigation } from 'expo-router';
import { useCallback, useEffect, useState } from 'react';

export const useAnimateOnFocus = () => {
  const navigation = useNavigation();
  const [isVisible, setIsVisible] = useState(false);

  // when the screen gains focus, set the visibility to true so the screen will animate in
  useFocusEffect(useCallback(() => setIsVisible(true), []));

  useEffect(() => {
    // when the screen loses focus, set the visibility to false so next time the
    // screen gains focus, it will animate in
    const unsubscribe = navigation.addListener('blur', () => setIsVisible(false));
    return unsubscribe;
  }, [navigation]);

  return isVisible;
};
