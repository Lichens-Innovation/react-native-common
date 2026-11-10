import { isNotBlank } from '@lichens-innovation/ts-common';
import { Image } from 'expo-image';
import { VideoView } from 'expo-video';
import React from 'react';
import { Dimensions, StyleSheet, TouchableOpacity, View } from 'react-native';
import { Icon } from 'react-native-paper';
import { getMediaTypeFromUri } from '../../utils/object.utils';
import { AppModal } from '../modal/app-modal';
import { MediaViewerAudioControls } from './media-viewer/media-viewer-audio-controls';
import { MediaViewerFab } from './media-viewer/media-viewer-fab';
import type { ViewerFabAction } from './media-viewer/media-viewer.types';
import { useMediaViewerPlayers } from './media-viewer/use-media-viewer-players';

export type { ViewerFabAction } from './media-viewer/media-viewer.types';

const { width, height } = Dimensions.get('window');

interface ViewerModalProps {
  visible: boolean;
  uri: string | null;
  onClose: () => void;
  fabAction?: ViewerFabAction | null;
}

const ViewerModal: React.FC<ViewerModalProps> = ({ visible, uri, onClose, fabAction }) => {
  const type = getMediaTypeFromUri(uri);
  const { audioPlayer, videoPlayer, stopPlayback } = useMediaViewerPlayers({ visible, type, uri });
  const hasUri = isNotBlank(uri);

  const handleClose = () => {
    stopPlayback();
    onClose();
  };

  return (
    <AppModal visible={visible} transparent animationType="fade" onRequestClose={handleClose}>
      <View style={styles.viewerOverlay}>
        <TouchableOpacity style={styles.closeButton} onPress={handleClose} activeOpacity={0.7}>
          <Icon source="close" size={32} color="#fff" />
        </TouchableOpacity>

        {type === 'image' && hasUri && (
          <Image
            source={uri}
            style={styles.fullscreenImage}
            contentFit="contain"
            cachePolicy="memory-disk"
            recyclingKey={uri}
          />
        )}

        {type === 'video' && hasUri && (
          <VideoView player={videoPlayer} style={styles.fullscreenVideo} contentFit="contain" nativeControls />
        )}

        {type === 'audio' && hasUri && <MediaViewerAudioControls player={audioPlayer} />}

        {!!fabAction && <MediaViewerFab action={fabAction} />}
      </View>
    </AppModal>
  );
};

export default ViewerModal;

const styles = StyleSheet.create({
  viewerOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.9)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  fullscreenImage: {
    width: width * 0.9,
    height: height * 0.8,
  },
  fullscreenVideo: {
    width: width * 0.9,
    height: height * 0.5,
  },
  closeButton: {
    position: 'absolute',
    top: 40,
    right: 20,
    zIndex: 10,
    backgroundColor: 'rgba(0,0,0,0.5)',
    borderRadius: 20,
    padding: 4,
  },
});
