import { useCallback, useMemo, useState, type FunctionComponent } from 'react';
import { StyleSheet, View } from 'react-native';
import { IconButton } from 'react-native-paper';
import { useAppTheme } from '../../theme';
import { CameraFullModal } from './camera-full-modal';
import { ObjectThumbnailHorizontalList } from './object-thumbnail-hozirontal-list';

interface CameraAndThumbnailsProps {
  uris: string[];
  disabled?: boolean;
  readonly?: boolean;
  handleObjectRemove: (uuid: string) => void;
  handleObjectsTaken: (newUris: string[]) => void;
  allowMultipleSelection?: boolean;
  enableVideo?: boolean;
}

interface CameraModalData {
  visible: boolean;
  mode: 'image' | 'video';
}

// Widget for displaying a gallery of images and videos with the ability to add new ones using the camera and remove existing ones. The value is expected to be an array of uris pointing to the media files. (uris for rendering, but in the real formData the object_uuids should be used)
export const CameraAndThumbnails: FunctionComponent<CameraAndThumbnailsProps> = ({
  uris,
  disabled,
  readonly,
  handleObjectRemove,
  handleObjectsTaken,
  allowMultipleSelection,
  enableVideo,
}) => {
  const styles = useStyles();

  const [cameraModal, setCameraModal] = useState<CameraModalData>({
    visible: false,
    mode: 'image',
  });

  const onTakePhoto = useCallback(() => {
    if (readonly || disabled) return;
    setCameraModal({ visible: true, mode: 'image' });
  }, [readonly, disabled]);

  const onTakeVideo = useCallback(() => {
    if (readonly || disabled) return;
    setCameraModal({ visible: true, mode: 'video' });
  }, [readonly, disabled]);

  const onCloseCamera = useCallback(() => setCameraModal({ visible: false, mode: 'image' }), []);

  return (
    <>
      <View style={styles.thumbnailsContainer}>
        <ObjectThumbnailHorizontalList onRemovePress={handleObjectRemove} uris={uris} readonly={readonly || disabled} />
      </View>
      <View style={styles.actionsRow}>
        <IconButton mode="contained" icon="camera" onPress={onTakePhoto} disabled={readonly || disabled} />

        {enableVideo ? (
          <IconButton mode="contained" icon="video" onPress={onTakeVideo} disabled={readonly || disabled} />
        ) : null}
      </View>

      {cameraModal.visible ? (
        <CameraFullModal
          mode={cameraModal.mode}
          onClose={onCloseCamera}
          handleObjectsTaken={handleObjectsTaken}
          allowMultipleSelection={allowMultipleSelection}
        />
      ) : null}
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
