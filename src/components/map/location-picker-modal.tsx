import { FunctionComponent, useState } from 'react';
import { StyleSheet, View, useWindowDimensions } from 'react-native';
import { Button, Modal, Portal } from 'react-native-paper';
import { useTranslation } from 'react-i18next';
import MapView, { Marker, PROVIDER_GOOGLE, type LatLng, type Region } from 'react-native-maps';
import { useAppTheme } from '../../theme';
import { useUserLocation } from './use-user-location';

export type GeoJsonPoint = {
  type: 'Point';
  /** [longitude, latitude] — GeoJSON spec order */
  coordinates: [number, number];
};

export const geoJsonPointToLatLng = (point: GeoJsonPoint | null | undefined): LatLng | null => {
  if (!point || point.type !== 'Point' || !Array.isArray(point.coordinates) || point.coordinates.length !== 2) {
    return null;
  }
  const [longitude, latitude] = point.coordinates;
  if (typeof latitude !== 'number' || typeof longitude !== 'number') return null;
  return { latitude, longitude };
};

const REGION_DELTA = 0.005;
const PICK_MARKER_COLOR = '#FF7E46';

const buildRegion = (coord: LatLng): Region => ({
  ...coord,
  latitudeDelta: REGION_DELTA,
  longitudeDelta: REGION_DELTA,
});

export type LocationPickerModalProps = {
  initialPoint: GeoJsonPoint | null;
  onConfirm: (lat: number, lng: number) => void;
  onCancel: () => void;
};

export const LocationPickerModal: FunctionComponent<LocationPickerModalProps> = ({
  initialPoint,
  onConfirm,
  onCancel,
}) => {
  const styles = useStyles();
  const { t } = useTranslation();
  const { userLocation, region: fallbackRegion } = useUserLocation();

  const startingCoord = geoJsonPointToLatLng(initialPoint);
  const regionCenter = startingCoord ?? userLocation;
  const initialRegion = regionCenter ? buildRegion(regionCenter) : fallbackRegion;

  const [pendingCoord, setPendingCoord] = useState<LatLng | null>(startingCoord);

  const handleMapPress = (e: { nativeEvent: { coordinate: LatLng } }) => {
    setPendingCoord(e.nativeEvent.coordinate);
  };

  const handleConfirm = () => {
    if (!pendingCoord) return;
    onConfirm(pendingCoord.latitude, pendingCoord.longitude);
  };

  return (
    <Portal>
      <Modal visible onDismiss={onCancel} contentContainerStyle={styles.container} dismissable={false}>
        <View style={styles.mapContainer}>
          <MapView
            provider={PROVIDER_GOOGLE}
            style={styles.map}
            initialRegion={initialRegion}
            showsUserLocation
            onPress={handleMapPress}
          >
            {pendingCoord ? (
              <Marker coordinate={pendingCoord} tracksViewChanges={false} pinColor={PICK_MARKER_COLOR} />
            ) : null}
          </MapView>
        </View>
        <View style={styles.footer}>
          <Button mode="outlined" onPress={onCancel} style={styles.footerButton}>
            {t('common:cancel')}
          </Button>
          <Button mode="contained" onPress={handleConfirm} disabled={!pendingCoord} style={styles.footerButton}>
            {t('common:confirm')}
          </Button>
        </View>
      </Modal>
    </Portal>
  );
};

const useStyles = () => {
  const theme = useAppTheme();
  const { width, height } = useWindowDimensions();

  return StyleSheet.create({
    container: {
      backgroundColor: theme.colors.background,
      width: width * 0.95,
      height: height * 0.9,
      alignSelf: 'center',
      borderRadius: 16,
      overflow: 'hidden',
    },
    mapContainer: {
      flex: 1,
    },
    map: {
      ...StyleSheet.absoluteFillObject,
    },
    footer: {
      flexDirection: 'row',
      justifyContent: 'flex-end',
      gap: theme.spacing(1),
      padding: theme.spacing(1.5),
      backgroundColor: theme.colors.surface,
    },
    footerButton: {
      minWidth: 120,
    },
  });
};
