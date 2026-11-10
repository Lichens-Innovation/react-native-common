import { useCallback, useMemo, useState, type FunctionComponent } from 'react';
import { StyleSheet, View } from 'react-native';
import { IconButton } from 'react-native-paper';
import { useAppTheme } from '../../theme/theme.index';
import { CameraFullModal } from './camera-full-modal';
import { ObjectThumbnailHorizontalList } from './object-thumbnail-hozirontal-list';
import type { ViewerFabAction } from './media-viewer-modal';

interface CameraAndThumbnailsProps {
  uris: string[];
  disabled?: boolean;
  readonly?: boolean;
  handleObjectRemove: (uuid: string) => void;
  handleObjectsTaken: (newUris: string[]) => void;
  allowMultipleSelection?: boolean;
  enableVideo?: boolean;
  getFabAction?: (uri: string) => ViewerFabAction | null;
}

interface CameraModalData {
  visible: boolean;
  mode: 'image' | 'video';
}

// `uris` are for rendering only: the real formData should hold the object_uuids. habit-hooks-disable non-essential-comment
export const CameraAndThumbnails: FunctionComponent<CameraAndThumbnailsProps> = ({
  uris,
  disabled,
  readonly,
  handleObjectRemove,
  handleObjectsTaken,
  allowMultipleSelection,
  enableVideo,
  getFabAction,
}) => {
  const styles = useStyles();
  const isLocked = readonly === true || disabled === true;

  const [cameraModal, setCameraModal] = useState<CameraModalData>({
    visible: false,
    mode: 'image',
  });

  const onTakePhoto = useCallback(() => {
    if (isLocked) return;
    setCameraModal({ visible: true, mode: 'image' });
  }, [isLocked]);

  const onTakeVideo = useCallback(() => {
    if (isLocked) return;
    setCameraModal({ visible: true, mode: 'video' });
  }, [isLocked]);

  const onCloseCamera = useCallback(() => setCameraModal({ visible: false, mode: 'image' }), []);

  return (
    <>
      <View style={styles.thumbnailsContainer}>
        <ObjectThumbnailHorizontalList
          onRemovePress={handleObjectRemove}
          uris={uris}
          readonly={isLocked}
          getFabAction={getFabAction}
        />
      </View>
      <View style={styles.actionsRow}>
        <IconButton mode="contained" icon="camera" onPress={onTakePhoto} disabled={isLocked} />

        {enableVideo && <IconButton mode="contained" icon="video" onPress={onTakeVideo} disabled={isLocked} />}
      </View>

      {cameraModal.visible && (
        <CameraFullModal
          mode={cameraModal.mode}
          onClose={onCloseCamera}
          handleObjectsTaken={handleObjectsTaken}
          allowMultipleSelection={allowMultipleSelection}
        />
      )}
    </>
  );
};

const useStyles = () => {
  const theme = useAppTheme();

  return useMemo(
    () =>
      StyleSheet.create({
        title: {
          marginBottom: theme.spacing(1),
        },
        actionsRow: {
          flexDirection: 'row',
          justifyContent: 'center',
          alignItems: 'center',
          gap: theme.spacing(1),
          marginTop: theme.spacing(1),
        },
        thumbnailsContainer: {
          marginHorizontal: theme.spacing(1),
        },
      }),
    [theme]
  );
};
