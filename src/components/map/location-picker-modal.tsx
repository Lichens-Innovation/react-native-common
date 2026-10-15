import { FunctionComponent, useState } from 'react';
import { StyleSheet, View } from 'react-native';
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
        <View style={styles.clip}>
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
          {/* Same buttons as the app's ModalActions: they share the width and wrap with Confirm on top.
            The padding sits on the outer view because Yoga mirrors it on a `wrap-reverse` row. */}
          <View style={styles.footer}>
            <View style={styles.footerRow}>
              <Button
                mode="outlined"
                onPress={onCancel}
                style={styles.footerButton}
                contentStyle={styles.footerButtonContent}
                labelStyle={styles.footerButtonLabel}
              >
                {t('common:cancel')}
              </Button>
              <Button
                mode="contained"
                onPress={handleConfirm}
                disabled={!pendingCoord}
                style={styles.footerButton}
                contentStyle={styles.footerButtonContent}
                labelStyle={styles.footerButtonLabel}
              >
                {t('common:confirm')}
              </Button>
            </View>
          </View>
        </View>
      </Modal>
    </Portal>
  );
};

const useStyles = () => {
  const theme = useAppTheme();

  return StyleSheet.create({
    // Sized in shares of Paper's wrapper, which already keeps clear of the system bars, so Paper can
    // centre it. The card is a Surface, whose shadow breaks under `overflow: hidden`: clip one in.
    // In dark mode a border, or the card's edge disappears into the backdrop.
    container: {
      backgroundColor: theme.colors.background,
      ...(theme.dark ? { borderWidth: 1, borderColor: theme.colors.outlineVariant } : {}),
      width: '90%',
      height: '90%',
      alignSelf: 'center',
      borderRadius: 20,
    },
    clip: {
      flex: 1,
      borderRadius: 20,
      overflow: 'hidden',
    },
    mapContainer: {
      flex: 1,
    },
    map: {
      ...StyleSheet.absoluteFillObject,
    },
    footer: {
      padding: 16,
      borderTopWidth: StyleSheet.hairlineWidth,
      borderTopColor: theme.colors.outlineVariant,
      backgroundColor: theme.colors.background,
    },
    footerRow: {
      flexDirection: 'row',
      flexWrap: 'wrap-reverse',
      gap: 8,
    },
    footerButton: {
      flexGrow: 1,
      flexShrink: 1,
      borderRadius: 12,
    },
    footerButtonContent: {
      height: 48,
    },
    footerButtonLabel: {
      fontWeight: 'bold',
    },
  });
};
