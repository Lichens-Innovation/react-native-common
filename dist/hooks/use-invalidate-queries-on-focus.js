import { useFocusEffect } from "@react-navigation/native";
import { useQueryClient } from "@tanstack/react-query";
import { useCallback } from "react";
export const useInvalidateQueriesOnFocus = (queryKeys) => {
    const queryClient = useQueryClient();
    useFocusEffect(useCallback(() => {
        const invalidationPromises = queryKeys.map((queryKey) => queryClient.invalidateQueries({ queryKey }));
        Promise.all(invalidationPromises);
    }, [queryClient]));
};
//# sourceMappingURL=use-invalidate-queries-on-focus.js.map