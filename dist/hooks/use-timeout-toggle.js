import { useToggle } from '@uidotdev/usehooks';
import { useCallback, useEffect, useRef } from 'react';
export const useTimeoutToggle = (timeoutMs) => {
    const [isLoading, toggleLoading] = useToggle(false);
    const timeoutRef = useRef(null);
    const onStartLoading = useCallback(() => {
        var _a;
        clearTimeout((_a = timeoutRef.current) !== null && _a !== void 0 ? _a : undefined);
        toggleLoading();
        timeoutRef.current = setTimeout(() => {
            toggleLoading();
            timeoutRef.current = null;
        }, timeoutMs);
    }, [timeoutMs, toggleLoading]);
    useEffect(() => {
        return () => { var _a; return clearTimeout((_a = timeoutRef.current) !== null && _a !== void 0 ? _a : undefined); };
    }, []);
    return [isLoading, onStartLoading];
};
//# sourceMappingURL=use-timeout-toggle.js.map