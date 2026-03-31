import { getRjsfDisplayLabel } from '@lichens-innovation/ts-common/rjsf';
import type { WidgetProps } from '@rjsf/utils';
import { type FunctionComponent } from 'react';
import { StyleSheet, View } from 'react-native';
import { useAppTheme } from '../../../theme';
import { RjsfDisplayLabel } from './display-label';
import { CameraAndThumbnails } from '../../objects/camera-and-thumbnails';

type ImageVideoGalleryWidgetOptions = {
  allowMultipleSelection?: boolean;
  enableVideo?: boolean;
};

// Widget for displaying a gallery of images and videos with the ability to add new ones using the camera and remove existing ones. The value is expected to be an array of uris pointing to the media files. (uris for rendering, but in the real formData the object_uuids should be used)
export const ImageVideoGalleryWidget: FunctionComponent<WidgetProps> = ({
  id,
  value,
  disabled,
  readonly,
  onChange,
  onBlur,
  label,
  hideLabel,
  required,
  options,
}) => {
  const styles = useStyles();

  const displayLabel = getRjsfDisplayLabel({ label, required, hideLabel });
  const widgetOptions = (options ?? {}) as ImageVideoGalleryWidgetOptions;
  const allowMultipleSelection = widgetOptions.allowMultipleSelection ?? true;
  const enableVideo = widgetOptions.enableVideo ?? true;
  const uris = Array.isArray(value) ? value : [];

  const handleObjectsTaken = (newUris: string[]) => {
    if (readonly || disabled) return;
    const nextValue = allowMultipleSelection ? [...uris, ...newUris] : newUris;
    onChange(nextValue);
    onBlur(id, nextValue);
  };

  const handleObjectRemove = (uriToRemove: string) => {
    if (readonly || disabled) return;

    const nextValue = uris.filter((uri) => uri !== uriToRemove);
    onChange(nextValue);
    onBlur(id, nextValue);
  };

  return (
    <View style={styles.widgetBlock}>
      <RjsfDisplayLabel label={displayLabel} style={styles.title} />
      <CameraAndThumbnails
        uris={uris}
        disabled={disabled}
        readonly={readonly}
        handleObjectRemove={handleObjectRemove}
        handleObjectsTaken={handleObjectsTaken}
        allowMultipleSelection={allowMultipleSelection}
        enableVideo={enableVideo}
      />
    </View>
  );
};

const useStyles = () => {
  const theme = useAppTheme();

  return StyleSheet.create({
    widgetBlock: {
      marginVertical: theme.spacing(0.5),
    },
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
  });
};
