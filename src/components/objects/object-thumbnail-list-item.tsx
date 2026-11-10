import { type FunctionComponent } from 'react';
import { Pressable, StyleSheet, View } from 'react-native';
import { Icon } from 'react-native-paper';
import ObjectThumbnail from './object-thumbnail';

const OBJECT_THUMBNAIL_SIZE = 84;

interface ObjectThumbnailListItemProps {
  uri: string;
  index: number;
  readonly?: boolean;
  onPress: (index: number) => void;
  onRemovePress: (uri: string) => void;
}

export const ObjectThumbnailListItem: FunctionComponent<ObjectThumbnailListItemProps> = ({
  uri,
  index,
  readonly,
  onPress,
  onRemovePress,
}) => (
  <View style={styles.mediaItem}>
    <ObjectThumbnail uri={uri} onPress={() => onPress(index)} size={OBJECT_THUMBNAIL_SIZE} />
    {!readonly && (
      <Pressable hitSlop={8} style={styles.deleteButton} onPress={() => onRemovePress(uri)}>
        <Icon source="close" size={14} color="#d35d4e" />
      </Pressable>
    )}
  </View>
);

const styles = StyleSheet.create({
  mediaItem: {
    position: 'relative',
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
