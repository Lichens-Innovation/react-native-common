import { useFocusEffect } from 'expo-router/react-navigation';
import { QueryKey, useQueryClient } from '@tanstack/react-query';
import { useCallback } from 'react';

export const useInvalidateQueriesOnFocus = (queryKeys: QueryKey[]) => {
  const queryClient = useQueryClient();

  useFocusEffect(
    useCallback(() => {
      const invalidationPromises = queryKeys.map((queryKey) => queryClient.invalidateQueries({ queryKey }));
      Promise.all(invalidationPromises);
    }, [queryClient])
  );
};
