import { FunctionComponent } from 'react';
import { Animated, StyleSheet, View } from 'react-native';
import { Text } from 'react-native-paper';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

interface CameraCaptureFeedbackProps {
  captureCount: number;
  snackbarMessage: string | null;
  snackbarAnim: Animated.Value;
}

export const CameraCaptureFeedback: FunctionComponent<CameraCaptureFeedbackProps> = ({
  captureCount,
  snackbarMessage,
  snackbarAnim,
}) => {
  const styles = useStyles();
  const hasCaptures = captureCount > 0;

  return (
    <>
      <View
        style={[styles.badgeContainer, { opacity: hasCaptures ? 1 : 0 }]}
        pointerEvents={hasCaptures ? 'auto' : 'none'}
      >
        <View style={styles.badge}>
          <Text style={styles.badgeText}>{captureCount}</Text>
        </View>
      </View>
      <Animated.View pointerEvents="none" style={[styles.inCameraSnackbar, { opacity: snackbarAnim }]}>
        <Text style={styles.inCameraSnackbarText}>{snackbarMessage ?? ''}</Text>
      </Animated.View>
    </>
  );
};

const useStyles = () => {
  const insets = useSafeAreaInsets();

  return StyleSheet.create({
    badgeContainer: {
      position: 'absolute',
      top: 50,
      right: 16,
      zIndex: 10,
    },
    badge: {
      minWidth: 28,
      height: 28,
      borderRadius: 14,
      backgroundColor: 'red',
      justifyContent: 'center',
      alignItems: 'center',
      paddingHorizontal: 6,
    },
    badgeText: {
      color: 'white',
      fontWeight: 'bold',
      fontSize: 16,
    },
    inCameraSnackbar: {
      position: 'absolute',
      top: insets.top + 16,
      left: 16,
      right: 16,
      backgroundColor: 'rgba(0,0,0,0.8)',
      borderRadius: 8,
      paddingVertical: 12,
      paddingHorizontal: 16,
      zIndex: 20,
    },
    inCameraSnackbarText: {
      color: 'white',
      fontSize: 14,
      textAlign: 'center',
    },
  });
};
