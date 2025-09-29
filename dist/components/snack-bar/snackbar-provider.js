import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { createContext, useCallback, useContext, useEffect, useState } from 'react';
import { InteractionManager } from 'react-native';
import { Snackbar } from 'react-native-paper';
import { SnackbarDurationsMs } from './snackbar.constants';
const DEFAULT_DURATION = SnackbarDurationsMs.SHORT;
export const SnackbarContext = createContext({
    showSnackbarMessage: (_msg, _duration = DEFAULT_DURATION) => { },
});
export const useSnackbar = () => useContext(SnackbarContext);
export const SnackbarProvider = ({ children }) => {
    const [message, setMessage] = useState('');
    const [duration, setDuration] = useState(DEFAULT_DURATION);
    const [isVisible, setVisibility] = useState(false);
    const showSnackbarMessage = useCallback((msg, duration = DEFAULT_DURATION) => {
        setVisibility(false); // close the current snackbar (if any)
        InteractionManager.runAfterInteractions(() => {
            setMessage(msg);
            setDuration(duration);
            setVisibility(true);
        });
    }, [setVisibility]);
    useEffect(() => {
        if (!isVisible)
            return;
        const timeoutId = setTimeout(() => setVisibility(false), duration);
        return () => clearTimeout(timeoutId);
    }, [isVisible, duration, setVisibility]);
    return (_jsxs(SnackbarContext.Provider, { value: { showSnackbarMessage }, children: [children, _jsx(Snackbar, { visible: isVisible, onDismiss: () => setVisibility(false), duration: Snackbar.DURATION_LONG, children: message })] }));
};
//# sourceMappingURL=snackbar-provider.js.map