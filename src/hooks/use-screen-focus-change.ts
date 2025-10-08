import { useFocusEffect, useNavigation } from 'expo-router';
import { useCallback, useEffect, useState } from 'react';
import { logger } from '../logger/logger';

export const useScreenFocusChange = () => {
  const navigation = useNavigation();
  const [isFocused, setIsFocused] = useState(false);

  useEffect(() => {
    logger.info(`[useScreenFocusChange] isFocused: ${isFocused}`);
  }, [isFocused]);

  useFocusEffect(useCallback(() => setIsFocused(true), []));

  useEffect(() => {
    const unsubscribe = navigation.addListener('blur', () => setIsFocused(false));
    return unsubscribe;
  }, [navigation]);

  return isFocused;
};
