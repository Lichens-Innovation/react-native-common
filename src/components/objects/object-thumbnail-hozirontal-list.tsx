import { useAppTheme } from '../../theme/theme';
import { type FunctionComponent, useMemo, useState } from 'react';
import { FlatList, StyleSheet } from 'react-native';
import ViewerModal, { type ViewerFabAction } from './media-viewer-modal';
import { ObjectThumbnailListItem } from './object-thumbnail-list-item';

const keyExtractor = (uri: string, index: number) => `${uri}-${index}`;

interface ObjectThumbnailHorizontalListProps {
  onRemovePress: (uuid: string) => void;
  readonly?: boolean;
  uris: string[];
  /** habit-hooks-disable non-essential-comment
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
  /* habit-hooks-disable non-essential-comment
   * Index, not uri: the file behind an open image can be replaced on disk while the viewer is showing
   * it — a downscaled preview swapped for the original, which changes the extension and therefore the
   * whole uri string. Holding the uri would leave the viewer pointed at a path that no longer exists.
   */
  const [viewerIndex, setViewerIndex] = useState<number | null>(null);
  const viewerUri = viewerIndex === null ? null : (uris[viewerIndex] ?? null);

  if (uris.length === 0) return null;

  return (
    <>
      <FlatList
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.rowContent}
        data={uris}
        keyExtractor={keyExtractor}
        renderItem={({ item, index }) => (
          <ObjectThumbnailListItem
            uri={item}
            index={index}
            readonly={readonly}
            onPress={setViewerIndex}
            onRemovePress={onRemovePress}
          />
        )}
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
      }),
    [theme]
  );
};
