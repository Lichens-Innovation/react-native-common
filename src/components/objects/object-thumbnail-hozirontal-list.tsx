import { useAppTheme } from '../../theme/theme';
import React, { type FunctionComponent, useState } from 'react';
import { Pressable, ScrollView, StyleSheet, View } from 'react-native';
import { Icon } from 'react-native-paper';
import ObjectThumbnail from './object-thumbnail';
import ViewerModal from './media-viewer-modal';

interface ObjectThumbnailHorizontalListProps {
  onRemovePress: (uuid: string) => void;
  uris: string[];
}

export const ObjectThumbnailHorizontalList: FunctionComponent<ObjectThumbnailHorizontalListProps> = ({
  onRemovePress,
  uris,
}) => {
  const styles = useStyles();
  const [viewerUri, setViewerUri] = useState<string | null>(null);

  if (uris.length === 0) return null;

  return (
    <>
      <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.rowContent}>
        {uris.map((uri, index) => {
          return (
            <View key={`${uri}-${index}`} style={styles.mediaItem}>
              <ObjectThumbnail uri={uri} onPress={() => setViewerUri(uri)} size={styles.thumb.width} />

              <Pressable hitSlop={8} style={styles.deleteButton} onPress={() => onRemovePress(uri)}>
                <Icon source="close" size={14} color="#d35d4e" />
              </Pressable>
            </View>
          );
        })}

        <ViewerModal visible={viewerUri !== null} uri={viewerUri} onClose={() => setViewerUri(null)} />
      </ScrollView>
    </>
  );
};

const useStyles = () => {
  const theme = useAppTheme();

  const THUMB = 84;

  return StyleSheet.create({
    rowContent: {
      flexDirection: 'row',
      gap: theme.spacing(1),
      paddingVertical: theme.spacing(0.5),
    },
    mediaItem: {
      position: 'relative',
    },
    thumb: {
      width: THUMB,
      height: THUMB,
      borderRadius: theme.roundness,
    },
    deleteButton: {
      position: 'absolute',
      top: 6,
      right: 6,
      backgroundColor: '#fff',
      borderRadius: 12,
      padding: 2,
      elevation: 2,
      shadowColor: '#000',
      shadowOffset: { width: 0, height: 1 },
      shadowOpacity: 0.15,
      shadowRadius: 2,
      alignItems: 'center',
      justifyContent: 'center',
    },
  });
};
