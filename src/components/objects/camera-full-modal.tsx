import React, { useEffect, useCallback, useRef, useState } from 'react';
import { logger } from '../../logger';
import { DialogOkCancel } from '../dialogs/dialog-ok-cancel';
import * as ExpoCamera from 'expo-camera';
import * as FileSystem from 'expo-file-system/legacy';
import { Alert, StyleSheet, TouchableOpacity, View } from 'react-native';
import Slider from '@react-native-community/slider';
import { Text, Icon } from 'react-native-paper';
import { AppModal } from '../modal/app-modal';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import * as MediaLibrary from 'expo-media-library';
import * as ImagePicker from 'expo-image-picker';
import { VolumeManager } from 'react-native-volume-manager';

interface CameraFullModalArgs {
  mode?: 'image' | 'video';
  onClose: () => void;
  handleObjectsTaken: (uris: string[]) => void;
  allowMultipleSelection?: boolean;
}

const PICTURE_PARAMS = { base64: false };
const VIDEO_PARAMS = {
  maxDuration: 60,
  codec: 'avc1' as ExpoCamera.VideoCodec,
};

export const CameraFullModal = ({
  mode,
  onClose,
  handleObjectsTaken,
  allowMultipleSelection = false,
}: CameraFullModalArgs) => {
  const styles = useStyles();
  const [facing, _setFacing] = useState<ExpoCamera.CameraType>('back');
  const [isRecording, setIsRecording] = useState(false);
  const [permission, requestPermission] = ExpoCamera.useCameraPermissions();
  const [audioPermission, requestAudioPermission] = ExpoCamera.useMicrophonePermissions();
  const cameraRef = useRef<ExpoCamera.CameraView | null>(null);
  const [zoom, setZoom] = useState(0);
  const [mediaPermission, requestMediaPermission] = MediaLibrary.usePermissions({
    writeOnly: true,
  });
  const [torchEnabled, setTorchEnabled] = useState(false);

  const closeCamera = async () => {
    try {
      if (isRecording && cameraRef.current) {
        cameraRef.current.stopRecording();
        setIsRecording(false);
      }
    } finally {
      setTorchEnabled(false);
      setTimeout(() => onClose(), 0);
    }
  };

  const ensureGalleryPermission = async () => {
    if (mediaPermission?.granted) return true;
    const res = await requestMediaPermission();
    return !!res?.granted;
  };

  const takePicture = async () => {
    if (!cameraRef.current) return;

    try {
      const picture = await cameraRef.current.takePictureAsync(PICTURE_PARAMS);
      if (!picture) {
        Alert.alert('Error', 'Failed to take picture.');
        return;
      }

      // Copy picture in user image gallery as an additional backup
      const ok = await ensureGalleryPermission();
      if (ok) {
        try {
          await MediaLibrary.saveToLibraryAsync(picture.uri);
        } catch (e) {
          logger.warn('Gallery backup failed:', e);
        }
      }
      const fileName = picture.uri.split('/').pop() || 'photo.jpg';
      const newPath = (FileSystem.documentDirectory ?? '') + fileName;
      await FileSystem.copyAsync({ from: picture.uri, to: newPath });
      handleObjectsTaken([newPath]);
      closeCamera();
    } catch (error) {
      Alert.alert('Error', 'Failed to save picture: ' + (error as Error).message);
    }
  };

  async function takeVideo() {
    if (audioPermission && !audioPermission.granted) {
      await requestAudioPermission();
    }
    if (!cameraRef.current) return;
    if (isRecording) {
      cameraRef.current.stopRecording();
      setIsRecording(false);
      return;
    }

    setIsRecording(true);
    const video = await cameraRef.current.recordAsync(VIDEO_PARAMS);
    if (!video) {
      Alert.alert('Error', 'Failed to record video.');
      setIsRecording(false);
      return;
    }

    // Copy video in user gallery as an additional backup
    const ok = await ensureGalleryPermission();
    if (ok) {
      try {
        await MediaLibrary.saveToLibraryAsync(video.uri);
      } catch (e) {
        logger.warn('Gallery backup failed:', e);
      }
    }
    handleObjectsTaken([video.uri]);
    closeCamera();
    setIsRecording(false);
  }

  const selectMedia = async () => {
    try {
      const permissionResult = await ImagePicker.requestMediaLibraryPermissionsAsync();
      if (!permissionResult.granted) {
        Alert.alert('Permission required', 'Permission to access the media library is required.');
        return;
      }
      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: mode === 'video' ? ['videos'] : ['images'],
        allowsEditing: false,
        quality: 1,
        allowsMultipleSelection: allowMultipleSelection,
      });
      if (!result.canceled && result?.assets?.length > 0) {
        handleObjectsTaken(result.assets.map((asset) => asset.uri));
        closeCamera();
      }
    } catch (e) {
      logger.warn('Media selection failed:', e);
      Alert.alert('Error', 'Failed to select media. Please try again.');
      setIsRecording(false);
    }
  };

  const onVolumePress = useCallback(async () => {
    if (!cameraRef.current) return;
    if (mode === 'image') {
      await takePicture();
    } else {
      await takeVideo();
    }
  }, [mode, isRecording]);

  const onVolumePressRef = useRef(onVolumePress);
  useEffect(() => {
    onVolumePressRef.current = onVolumePress;
  }, [onVolumePress]);

  const lastTriggerAtRef = useRef(0);

  useEffect(() => {
    const clampInitialVolume = async () => {
      try {
        const { volume } = await VolumeManager.getVolume();
        let newVolume = volume;
        if (volume < 0.1) newVolume = 0.1;
        if (volume > 0.9) newVolume = 0.9;
        if (newVolume !== volume) {
          await VolumeManager.setVolume(newVolume, { showUI: false });
        }
      } catch (e) {
        logger.warn('Failed to clamp volume', e);
      }
    };

    clampInitialVolume();
    const sub = VolumeManager.addVolumeListener(async () => {
      const now = Date.now();
      if (now - lastTriggerAtRef.current < 2000) {
        return;
      }
      lastTriggerAtRef.current = now;
      await onVolumePressRef.current();
    });
    return () => {
      sub?.remove?.();
    };
  }, []);

  if (!permission?.granted) {
    return (
      <DialogOkCancel
        isVisible={true}
        title="Permissions requises"
        description="Nous avons besoin de vos permissions pour montrer la caméra"
        onOk={requestPermission}
        onCancel={onClose}
      />
    );
  }

  return (
    <AppModal visible={true} onDismiss={closeCamera} style={styles.container}>
      <ExpoCamera.CameraView
        mode={mode === 'video' ? 'video' : 'picture'}
        style={styles.camera}
        facing={facing}
        ref={cameraRef}
        enableTorch={torchEnabled}
        zoom={zoom}
      >
        <View style={styles.overlay}>
          <View style={{ flex: 1 }} />
          <View style={styles.bottomControls}>
            <View style={styles.sliderContainer}>
              <Slider
                style={styles.slider}
                minimumValue={0}
                maximumValue={1}
                step={0.01}
                value={zoom}
                onValueChange={setZoom}
                minimumTrackTintColor="#fff"
                maximumTrackTintColor="#888"
                thumbTintColor="#fff"
              />
              <TouchableOpacity
                style={styles.flashButton}
                onPress={() => {
                  setTorchEnabled((v) => !v);
                }}
              >
                <Icon source={'flashlight'} size={30} color={torchEnabled ? 'yellow' : 'white'} />
              </TouchableOpacity>
            </View>
            <View style={styles.buttonContainer}>
              <TouchableOpacity style={styles.button} onPress={closeCamera}>
                <Icon source="arrow-left" size={30} color="white" />
              </TouchableOpacity>

              {mode === 'image' ? (
                <TouchableOpacity style={styles.button} onPress={takePicture}>
                  <Icon source="camera" size={30} color="white" />
                </TouchableOpacity>
              ) : (
                <TouchableOpacity style={styles.button} onPress={takeVideo}>
                  {isRecording ? (
                    <Icon source="stop" size={30} color="white" />
                  ) : (
                    <Icon source="video" size={30} color="white" />
                  )}
                  <Text style={styles.text}>{isRecording ? 'Stop' : 'Video'}</Text>
                </TouchableOpacity>
              )}
              <TouchableOpacity style={styles.button} onPress={selectMedia}>
                <Icon source="image" size={30} color="white" />
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </ExpoCamera.CameraView>
    </AppModal>
  );
};

const useStyles = () => {
  const insets = useSafeAreaInsets();

  return StyleSheet.create({
    container: {
      flex: 1,
      width: '100%',
    },
    message: {
      textAlign: 'center',
      paddingBottom: 10,
    },
    camera: {
      flex: 1,
    },
    overlay: {
      flex: 1,
      justifyContent: 'space-between',
    },
    bottomControls: {
      width: '100%',
      paddingBottom: 24 + insets.bottom,
    },
    sliderContainer: {
      marginHorizontal: 40,
      backgroundColor: 'rgba(0,0,0,0.3)',
      borderRadius: 8,
      padding: 8,
      flexDirection: 'row',
    },
    slider: {
      width: '80%',
      height: 40,
    },
    buttonContainer: {
      flexDirection: 'row',
      backgroundColor: 'transparent',
      marginHorizontal: 32,
      marginVertical: 8,
    },
    button: {
      flex: 1,
      alignSelf: 'flex-end',
      alignItems: 'center',
      borderRadius: 32,
      backgroundColor: 'rgba(0,0,0,0.3)',
      height: 100,
      justifyContent: 'center',
      marginHorizontal: 8,
    },
    flashButton: {
      alignSelf: 'flex-end',
      alignItems: 'center',
      borderRadius: 32,
      backgroundColor: 'rgba(0,0,0,0.3)',
      height: 50,
      width: 50,
      justifyContent: 'center',
      marginHorizontal: 8,
    },
    text: {
      fontSize: 16,
      fontWeight: 'bold',
      color: 'white',
    },
  });
};
