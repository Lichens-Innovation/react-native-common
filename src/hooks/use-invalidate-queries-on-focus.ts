import { useFocusEffect } from 'expo-router/react-navigation';
import { QueryKey, useQueryClient } from '@tanstack/react-query';
import { useCallback, useLayoutEffect, useRef } from 'react';

export const useInvalidateQueriesOnFocus = (queryKeys: QueryKey[]) => {
  const queryClient = useQueryClient();
  // Callers usually pass a new array on every render: read the latest keys on focus without re-running the focus effect. habit-hooks-disable non-essential-comment
  const queryKeysRef = useRef(queryKeys);
  useLayoutEffect(() => {
    queryKeysRef.current = queryKeys;
  }, [queryKeys]);

  useFocusEffect(
    useCallback(() => {
      const invalidationPromises = queryKeysRef.current.map((queryKey) => queryClient.invalidateQueries({ queryKey }));
      void Promise.all(invalidationPromises);
    }, [queryClient])
  );
};
