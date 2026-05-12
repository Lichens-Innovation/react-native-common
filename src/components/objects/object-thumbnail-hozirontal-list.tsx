import { useAppTheme } from '../../theme/theme';
import React, { type FunctionComponent, useCallback, useMemo, useState } from 'react';
import { FlatList, type ListRenderItem, Pressable, StyleSheet, View } from 'react-native';
import { Icon } from 'react-native-paper';
import ObjectThumbnail from './object-thumbnail';
import ViewerModal from './media-viewer-modal';

interface ObjectThumbnailHorizontalListProps {
  onRemovePress: (uuid: string) => void;
  readonly?: boolean;
  uris: string[];
}

export const ObjectThumbnailHorizontalList: FunctionComponent<ObjectThumbnailHorizontalListProps> = ({
  onRemovePress,
  readonly,
  uris,
}) => {
  const styles = useStyles();
  const [viewerUri, setViewerUri] = useState<string | null>(null);

  const keyExtractor = useCallback((uri: string, index: number) => `${uri}-${index}`, []);

  const renderItem = useCallback<ListRenderItem<string>>(
    ({ item: uri }) => (
      <View style={styles.mediaItem}>
        <ObjectThumbnail uri={uri} onPress={() => setViewerUri(uri)} size={styles.thumb.width} />
        {!readonly && (
          <Pressable hitSlop={8} style={styles.deleteButton} onPress={() => onRemovePress(uri)}>
            <Icon source="close" size={14} color="#d35d4e" />
          </Pressable>
        )}
      </View>
    ),
    [readonly, onRemovePress, styles]
  );

  if (uris.length === 0) return null;

  return (
    <>
      <FlatList
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.rowContent}
        data={uris}
        keyExtractor={keyExtractor}
        renderItem={renderItem}
        removeClippedSubviews
        windowSize={5}
        initialNumToRender={4}
        maxToRenderPerBatch={4}
      />
      <ViewerModal visible={viewerUri !== null} uri={viewerUri} onClose={() => setViewerUri(null)} />
    </>
  );
};

const THUMB = 84;

const useStyles = () => {
  const theme = useAppTheme();

  return useMemo(
    () =>
      StyleSheet.create({
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
      }),
    [theme]
  );
};
