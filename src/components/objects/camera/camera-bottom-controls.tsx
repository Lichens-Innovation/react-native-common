import Slider from '@react-native-community/slider';
import { FunctionComponent } from 'react';
import { StyleSheet, TouchableOpacity, View } from 'react-native';
import { Icon, Text } from 'react-native-paper';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import type { CameraCaptureMode } from './camera-capture.types';

interface CameraBottomControlsProps {
  mode?: CameraCaptureMode;
  isRecording: boolean;
  zoom: number;
  onZoomChange: (zoom: number) => void;
  torchEnabled: boolean;
  onToggleTorch: () => void;
  onBack: () => void;
  onShutter: () => void;
  onSelectMedia: () => void;
}

export const CameraBottomControls: FunctionComponent<CameraBottomControlsProps> = ({
  mode,
  isRecording,
  zoom,
  onZoomChange,
  torchEnabled,
  onToggleTorch,
  onBack,
  onShutter,
  onSelectMedia,
}) => {
  const styles = useStyles();

  return (
    <View style={styles.bottomControls}>
      <View style={styles.sliderContainer}>
        <Slider
          style={styles.slider}
          minimumValue={0}
          maximumValue={1}
          step={0.01}
          value={zoom}
          onValueChange={onZoomChange}
          minimumTrackTintColor="#fff"
          maximumTrackTintColor="#888"
          thumbTintColor="#fff"
        />
        <TouchableOpacity style={styles.flashButton} onPress={onToggleTorch}>
          <Icon source="flashlight" size={30} color={torchEnabled ? 'yellow' : 'white'} />
        </TouchableOpacity>
      </View>
      <View style={styles.buttonContainer}>
        <TouchableOpacity style={styles.button} onPress={onBack}>
          <Icon source="arrow-left" size={30} color="white" />
        </TouchableOpacity>

        {mode === 'image' ? (
          <TouchableOpacity style={styles.button} onPress={onShutter}>
            <Icon source="camera" size={30} color="white" />
          </TouchableOpacity>
        ) : (
          <TouchableOpacity style={styles.button} onPress={onShutter}>
            <Icon source={isRecording ? 'stop' : 'video'} size={30} color="white" />
            <Text style={styles.text}>{isRecording ? 'Stop' : 'Video'}</Text>
          </TouchableOpacity>
        )}
        <TouchableOpacity style={styles.button} onPress={onSelectMedia}>
          <Icon source="image" size={30} color="white" />
        </TouchableOpacity>
      </View>
    </View>
  );
};

const useStyles = () => {
  const insets = useSafeAreaInsets();

  return StyleSheet.create({
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
