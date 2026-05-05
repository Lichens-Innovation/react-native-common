import { useTranslation } from 'react-i18next';
import React, { useEffect } from 'react';
import { View, StyleSheet, TouchableOpacity, Alert } from 'react-native';
import { Image } from 'expo-image';
import { Icon } from 'react-native-paper';
import { getMediaTypeFromUri, getThumbnailUri } from '../../utils/object.utils';

interface ObjectThumbnailProps {
  uri: string | undefined;
  onPress: () => void;
  size?: number;
}

const ObjectThumbnail: React.FC<ObjectThumbnailProps> = ({ uri, onPress, size = 100 }) => {
  const { t } = useTranslation();
  const mediaType = getMediaTypeFromUri(uri);
  const [thumbnailUri, setThumbnailUri] = React.useState<string>('');
  const showPlayIcon = mediaType === 'video' || mediaType === 'audio';
  const noUriIconName = mediaType === 'video' ? 'video-off' : mediaType === 'audio' ? 'music-off' : 'image-off';
  const playIconName = mediaType === 'video' ? 'play-circle-outline' : 'music-note';
  const styles = createStyles(size);

  useEffect(() => {
    if (mediaType === 'video' && uri) {
      const fetchThumbnail = async () => {
        const tempUri = await getThumbnailUri(uri, mediaType);
        setThumbnailUri(tempUri);
      };
      fetchThumbnail();
    }
  }, [mediaType, uri]);

  function handleNoUriPress() {
    Alert.alert('', t('app:objects.notCached'), [
      {
        text: t('app:environment.cancel', 'Cancel'),
        style: 'cancel',
      },
    ]);
  }

  if (!uri) {
    return (
      <TouchableOpacity style={styles.errorContainer} onPress={handleNoUriPress}>
        <Icon source={noUriIconName} size={size * 0.3} color="#999" />
      </TouchableOpacity>
    );
  }

  return (
    <TouchableOpacity onPress={onPress} style={styles.container}>
      <Image
        source={thumbnailUri || uri}
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
