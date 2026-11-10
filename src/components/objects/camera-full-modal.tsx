import * as ExpoCamera from 'expo-camera';
import React from 'react';
import { Animated, StyleSheet, View } from 'react-native';
import { AppModal } from '../modal/app-modal';
import { CameraBottomControls } from './camera/camera-bottom-controls';
import type { CameraFullModalArgs } from './camera/camera-capture.types';
import { CameraCaptureFeedback } from './camera/camera-capture-feedback';
import { CameraPermissionDialog } from './camera/camera-permission-dialog';
import { useCameraCapture } from './camera/use-camera-capture';

const CAMERA_FACING: ExpoCamera.CameraType = 'back';
const VIDEO_QUALITY: ExpoCamera.VideoQuality = '1080p';

export const CameraFullModal = ({
  mode,
  onClose,
  handleObjectsTaken,
  allowMultipleSelection = true,
}: CameraFullModalArgs) => {
  const [permission, requestPermission] = ExpoCamera.useCameraPermissions();
  const {
    cameraRef,
    state,
    isAudioGranted,
    snackbarMessage,
    snackbarAnim,
    flashAnim,
    close,
    shutter,
    pickFromLibrary,
  } = useCameraCapture({ mode, onClose, handleObjectsTaken, allowMultipleSelection });

  // Still reading the permission: showing the dialog now would flash it even when access is granted. habit-hooks-disable non-essential-comment
  if (!permission) return null;

  if (!permission.granted) {
    return <CameraPermissionDialog permission={permission} requestPermission={requestPermission} onClose={onClose} />;
  }

  return (
    <AppModal visible={true} onDismiss={close} style={styles.container}>
      <View style={styles.container}>
        <ExpoCamera.CameraView
          mode={mode === 'video' ? 'video' : 'picture'}
          style={StyleSheet.absoluteFill}
          facing={CAMERA_FACING}
          ref={cameraRef}
          enableTorch={state.torchEnabled}
          zoom={state.zoom}
          videoQuality={VIDEO_QUALITY}
          // Android refuses to record unmuted without the microphone permission. habit-hooks-disable non-essential-comment
          mute={!isAudioGranted}
        />
        <CameraCaptureFeedback
          captureCount={state.captureCount}
          snackbarMessage={snackbarMessage}
          snackbarAnim={snackbarAnim}
        />
        <View style={styles.overlay}>
          <View style={styles.spacer} />
          <CameraBottomControls
            mode={mode}
            isRecording={state.isRecording}
            zoom={state.zoom}
            onZoomChange={state.setZoom}
            torchEnabled={state.torchEnabled}
            onToggleTorch={() => state.setTorchEnabled((enabled) => !enabled)}
            onBack={close}
            onShutter={shutter}
            onSelectMedia={pickFromLibrary}
          />
        </View>
        <Animated.View pointerEvents="none" style={[styles.captureFlashOverlay, { opacity: flashAnim }]} />
      </View>
    </AppModal>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    width: '100%',
  },
  overlay: {
    flex: 1,
    justifyContent: 'space-between',
  },
  spacer: {
    flex: 1,
  },
  captureFlashOverlay: {
    ...StyleSheet.absoluteFill,
    backgroundColor: 'white',
  },
});
