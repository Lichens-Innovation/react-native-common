import { useAppTheme } from '../../theme/theme';
import React, { type FunctionComponent, useCallback, useMemo, useState } from 'react';
import { FlatList, type ListRenderItem, Pressable, StyleSheet, View } from 'react-native';
import { Icon } from 'react-native-paper';
import ObjectThumbnail from './object-thumbnail';
import ViewerModal, { type ViewerFabAction } from './media-viewer-modal';

interface ObjectThumbnailHorizontalListProps {
  onRemovePress: (uuid: string) => void;
  readonly?: boolean;
  uris: string[];
  /**
   * Optional action offered in the fullscreen viewer for the media it is showing. Called per uri so
   * the answer can differ from one item to the next; return null for items that have no action.
   */
  getFabAction?: (uri: string) => ViewerFabAction | null;
}

export const ObjectThumbnailHorizontalList: FunctionComponent<ObjectThumbnailHorizontalListProps> = ({
  onRemovePress,
  readonly,
  uris,
  getFabAction,
}) => {
  const styles = useStyles();
  // Index, not uri: the file behind an open image can be replaced on disk while the viewer is showing
  // it — a downscaled preview swapped for the original, which changes the extension and therefore the
  // whole uri string. Holding the uri would leave the viewer pointed at a path that no longer exists.
  const [viewerIndex, setViewerIndex] = useState<number | null>(null);
  const viewerUri = viewerIndex === null ? null : (uris[viewerIndex] ?? null);

  const keyExtractor = useCallback((uri: string, index: number) => `${uri}-${index}`, []);

  const renderItem = useCallback<ListRenderItem<string>>(
    ({ item: uri, index }) => (
      <View style={styles.mediaItem}>
        <ObjectThumbnail uri={uri} onPress={() => setViewerIndex(index)} size={styles.thumb.width} />
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
      <ViewerModal
        visible={viewerUri !== null}
        uri={viewerUri}
        fabAction={viewerUri ? (getFabAction?.(viewerUri) ?? null) : null}
        onClose={() => setViewerIndex(null)}
      />
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
