import { JSX, PropsWithChildren, createContext, useCallback, useContext, useEffect, useState } from 'react';
import { InteractionManager } from 'react-native';
import { Snackbar } from 'react-native-paper';
import { SnackbarDurationsMs } from './snackbar.constants';

const DEFAULT_DURATION = SnackbarDurationsMs.SHORT;

export const SnackbarContext = createContext({
  showSnackbarMessage: (_msg: string, _duration = DEFAULT_DURATION) => {},
});

export const useSnackbar = () => useContext(SnackbarContext);

// Module-scoped handle so non-React callers can show a
// snackbar without holding a hook reference. The SnackbarProvider registers
// itself on mount; calls before mount are dropped (and warned about).
let globalShowSnackbar: ((msg: string, duration?: number) => void) | null = null;

export const showSnackbarGlobal = (msg: string, duration: number = DEFAULT_DURATION): void => {
  if (!globalShowSnackbar) {
    // eslint-disable-next-line no-console
    console.warn('[Snackbar] showSnackbarGlobal called before SnackbarProvider mounted; dropping:', msg);
    return;
  }
  globalShowSnackbar(msg, duration);
};

export const SnackbarProvider = ({ children }: PropsWithChildren): JSX.Element => {
  const [message, setMessage] = useState('');
  const [duration, setDuration] = useState(DEFAULT_DURATION);
  const [isVisible, setVisibility] = useState(false);

  const showSnackbarMessage = useCallback(
    (msg: string, duration = DEFAULT_DURATION) => {
      setVisibility(false); // close the current snackbar (if any)

      InteractionManager.runAfterInteractions(() => {
        setMessage(msg);
        setDuration(duration);
        setVisibility(true);
      });
    },
    [setVisibility]
  );

  useEffect(() => {
    globalShowSnackbar = showSnackbarMessage;
    return () => {
      if (globalShowSnackbar === showSnackbarMessage) globalShowSnackbar = null;
    };
  }, [showSnackbarMessage]);

  useEffect(() => {
    if (!isVisible) return;

    const timeoutId = setTimeout(() => setVisibility(false), duration);
    return () => clearTimeout(timeoutId);
  }, [isVisible, duration, setVisibility]);

  return (
    <SnackbarContext.Provider value={{ showSnackbarMessage }}>
      {children}

      <Snackbar visible={isVisible} onDismiss={() => setVisibility(false)} duration={Snackbar.DURATION_LONG}>
        {message}
      </Snackbar>
    </SnackbarContext.Provider>
  );
};
