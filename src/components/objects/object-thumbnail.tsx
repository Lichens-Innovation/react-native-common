import { useTranslation } from 'react-i18next';
import React, { useCallback, useEffect, useMemo } from 'react';
import { View, StyleSheet, TouchableOpacity, Alert } from 'react-native';
import { Image } from 'expo-image';
import { Icon } from 'react-native-paper';
import { isBlank } from '@lichens-innovation/ts-common';
import { logger } from '../../logger/logger';
import { getMediaTypeFromUri, getThumbnailUri, type MediaType } from '../../utils/object.utils';

const PLAYABLE_MEDIA_TYPES: ReadonlyArray<MediaType | undefined> = ['video', 'audio'];

const NO_URI_ICON_BY_MEDIA_TYPE: Record<MediaType, string> = {
  video: 'video-off',
  audio: 'music-off',
  image: 'image-off',
};

interface ObjectThumbnailProps {
  uri?: string;
  onPress: () => void;
  size?: number;
}

const ObjectThumbnail: React.FC<ObjectThumbnailProps> = ({ uri, onPress, size = 100 }) => {
  const { t } = useTranslation();
  const mediaType = getMediaTypeFromUri(uri);
  const [thumbnailUri, setThumbnailUri] = React.useState<string>('');
  const showPlayIcon = PLAYABLE_MEDIA_TYPES.includes(mediaType);
  const noUriIconName = mediaType ? NO_URI_ICON_BY_MEDIA_TYPE[mediaType] : NO_URI_ICON_BY_MEDIA_TYPE.image;
  const playIconName = mediaType === 'video' ? 'play-circle-outline' : 'music-note';
  const styles = useMemo(() => createStyles(size), [size]);

  useEffect(() => {
    if (mediaType !== 'video' || isBlank(uri)) return;

    getThumbnailUri(uri, mediaType)
      .then(setThumbnailUri)
      .catch((error: unknown) => logger.error('[ObjectThumbnail] Failed to generate video thumbnail', error));
  }, [mediaType, uri]);

  const handleNoUriPress = useCallback(() => {
    Alert.alert('', t('app:objects.notCached'), [
      {
        text: t('app:environment.cancel', 'Cancel'),
        style: 'cancel',
      },
    ]);
  }, [t]);

  if (isBlank(uri)) {
    return (
      <TouchableOpacity style={styles.errorContainer} onPress={handleNoUriPress}>
        <Icon source={noUriIconName} size={size * 0.3} color="#999" />
      </TouchableOpacity>
    );
  }

  return (
    <TouchableOpacity onPress={onPress} style={styles.container}>
      <Image
        source={isBlank(thumbnailUri) ? uri : thumbnailUri}
        style={styles.image}
        contentFit="cover"
        cachePolicy="memory-disk"
        recyclingKey={uri}
      />
      {showPlayIcon && (
        <View style={styles.playIconContainer}>
          <Icon source={playIconName} size={size * 0.3} color="white" />
        </View>
      )}
    </TouchableOpacity>
  );
};

const createStyles = (size: number) =>
  StyleSheet.create({
    container: {
      borderRadius: 8,
      overflow: 'hidden',
      backgroundColor: '#f0f0f0',
      justifyContent: 'center',
      alignItems: 'center',
      width: size,
      height: size,
    },
    errorContainer: {
      borderRadius: 8,
      overflow: 'hidden',
      backgroundColor: '#f8f8f8',
      justifyContent: 'center',
      alignItems: 'center',
      width: size,
      height: size,
    },
    image: {
      width: '100%',
      height: '100%',
    },
    playIconContainer: {
      position: 'absolute',
      top: '50%',
      left: '50%',
      transform: [{ translateX: -16 }, { translateY: -16 }],
      opacity: 0.85,
    },
  });

export default ObjectThumbnail;
