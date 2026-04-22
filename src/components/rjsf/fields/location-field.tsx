import { FunctionComponent, useState } from 'react';
import { getRjsfDisplayLabel } from '@lichens-innovation/ts-common/rjsf';
import type { FieldProps, RJSFSchema } from '@rjsf/utils';
import { StyleSheet, View } from 'react-native';
import { Button, Divider, Text } from 'react-native-paper';
import * as Location from 'expo-location';
import { useTranslation } from 'react-i18next';
import { useAppTheme } from '../../../theme';
import { logger } from '../../../logger';
import { useSnackbar } from '../../snack-bar/snackbar-provider';
import {
  LocationPickerModal,
  geoJsonPointToLatLng,
  type GeoJsonPoint,
} from '../../map/location-picker-modal';

type LocationFieldValue = { coordinates?: GeoJsonPoint | null };

const createGeoJsonPoint = (lat: number, lng: number): GeoJsonPoint => ({
  type: 'Point',
  coordinates: [lng, lat],
});

export const LocationField: FunctionComponent<FieldProps<Record<string, unknown>, RJSFSchema>> = ({
  formData,
  onChange,
  schema,
  required,
  disabled,
  readonly,
  fieldPathId,
  id,
}) => {
  const styles = useStyles();
  const { t } = useTranslation();
  const { showSnackbarMessage } = useSnackbar();
  const [mapModalVisible, setMapModalVisible] = useState(false);

  const current = (formData as LocationFieldValue | undefined)?.coordinates ?? null;
  const label = typeof schema.title === 'string' ? schema.title : '';
  const displayLabel = getRjsfDisplayLabel({ label, required });
  const baseId = fieldPathId?.$id ?? id ?? 'locationField';
  const fieldPath = fieldPathId?.path ?? [];
  const actionsDisabled = disabled || readonly;

  const writeValue = (value: LocationFieldValue) => {
    onChange(value as Record<string, unknown>, fieldPath, undefined, baseId);
  };

  const writePoint = (lat: number, lng: number) => writeValue({ coordinates: createGeoJsonPoint(lat, lng) });
  const clear = () => writeValue({ coordinates: null });

  const captureViaGps = async () => {
    try {
      const { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== 'granted') {
        showSnackbarMessage(t('common:location.permissionDenied'));
        return;
      }
      const pos = await Location.getCurrentPositionAsync({});
      writePoint(pos.coords.latitude, pos.coords.longitude);
    } catch (error) {
      logger.error('LocationField GPS error', error);
      showSnackbarMessage(t('common:location.error'));
    }
  };

  const confirmMapPick = (lat: number, lng: number) => {
    writePoint(lat, lng);
    setMapModalVisible(false);
  };

  return (
    <View style={styles.container}>
      {displayLabel ? <Text variant="titleMedium">{displayLabel}</Text> : null}

      <CoordinatePreview point={current} onClear={clear} disabled={actionsDisabled} />

      <View style={styles.buttonRow}>
        <Button
          mode="contained-tonal"
          icon="crosshairs-gps"
          style={styles.button}
          onPress={captureViaGps}
          disabled={actionsDisabled}
        >
          {t('common:location.useGps')}
        </Button>
        <Button
          mode="outlined"
          icon="map"
          style={styles.button}
          onPress={() => setMapModalVisible(true)}
          disabled={actionsDisabled}
        >
          {t('common:location.pickOnMap')}
        </Button>
      </View>

      {mapModalVisible ? (
        <LocationPickerModal
          initialPoint={current}
          onConfirm={confirmMapPick}
          onCancel={() => setMapModalVisible(false)}
        />
      ) : null}

      <Divider style={styles.divider} />
    </View>
  );
};

type CoordinatePreviewProps = {
  point: GeoJsonPoint | null;
  onClear: () => void;
  disabled?: boolean;
};

const CoordinatePreview: FunctionComponent<CoordinatePreviewProps> = ({ point, onClear, disabled }) => {
  const styles = useStyles();
  const { t } = useTranslation();

  if (!point) {
    return (
      <Text variant="bodySmall" style={styles.emptyText}>
        {t('common:location.noLocationCaptured')}
      </Text>
    );
  }

  const coord = geoJsonPointToLatLng(point);
  if (!coord) return null;

  return (
    <View style={styles.coordRow}>
      <Text variant="bodyMedium" style={styles.coordText}>
        {coord.latitude.toFixed(6)}, {coord.longitude.toFixed(6)}
      </Text>
      <Button mode="text" compact icon="close" onPress={onClear} disabled={disabled}>
        {t('common:location.clearLocation')}
      </Button>
    </View>
  );
};

const useStyles = () => {
  const theme = useAppTheme();

  return StyleSheet.create({
    container: {
      gap: theme.spacing(1),
      marginVertical: theme.spacing(0.5),
    },
    coordRow: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
      gap: theme.spacing(1),
    },
    coordText: {
      flex: 1,
    },
    emptyText: {
      opacity: 0.6,
    },
    buttonRow: {
      flexDirection: 'row',
      gap: theme.spacing(1),
    },
    button: {
      flex: 1,
    },
    divider: {
      marginTop: theme.spacing(2),
    },
  });
};
