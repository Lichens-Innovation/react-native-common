import { FunctionComponent } from 'react';
import { StyleSheet, Text, TouchableOpacity } from 'react-native';
import { ActivityIndicator, Icon } from 'react-native-paper';
import type { ViewerFabAction } from './media-viewer.types';

interface MediaViewerFabProps {
  action: ViewerFabAction;
}

export const MediaViewerFab: FunctionComponent<MediaViewerFabProps> = ({ action }) => (
  <TouchableOpacity
    style={styles.fab}
    onPress={action.onPress}
    disabled={action.busy}
    activeOpacity={0.7}
    accessibilityRole="button"
    accessibilityLabel={action.label}
  >
    {action.busy ? (
      <ActivityIndicator color="#fff" size="small" />
    ) : (
      <Icon source={action.icon} size={22} color="#fff" />
    )}
    <Text style={styles.fabLabel}>{action.label}</Text>
  </TouchableOpacity>
);

const styles = StyleSheet.create({
  fab: {
    position: 'absolute',
    bottom: 40,
    alignSelf: 'center',
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    paddingVertical: 10,
    paddingHorizontal: 18,
    borderRadius: 24,
    backgroundColor: 'rgba(0,0,0,0.6)',
  },
  fabLabel: {
    color: '#fff',
    fontSize: 15,
    fontWeight: '500',
  },
});
