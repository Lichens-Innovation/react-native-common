import { isNotBlank } from '@lichens-innovation/ts-common';
import { getRjsfDisplayLabel, getRjsfLabelColor } from '@lichens-innovation/ts-common/rjsf';
import type { FieldProps, RJSFSchema } from '@rjsf/utils';
import { StyleSheet, View } from 'react-native';
import { Button, Divider, Text } from 'react-native-paper';
import * as Location from 'expo-location';
import { useState, type FunctionComponent } from 'react';
import { useTranslation } from 'react-i18next';
import { useAppTheme } from '../../../theme/theme.index';
import { logger } from '../../../logger/logger.index';
import { useSnackbar } from '../../snack-bar/snackbar-provider';
import { LocationPickerModal, type GeoJsonPoint } from '../../map/location-picker-modal';
import { CoordinatePreview } from './coordinate-preview';

interface LocationFieldValue {
  coordinates?: GeoJsonPoint | null;
}

const createGeoJsonPoint = (lat: number, lng: number): GeoJsonPoint => ({
  type: 'Point',
  coordinates: [lng, lat],
});

export const LocationField: FunctionComponent<FieldProps<Record<string, unknown>, RJSFSchema>> = ({
  formData,
  onChange,
  schema,
  uiSchema,
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
  const labelColor = getRjsfLabelColor(uiSchema?.['ui:options']);
  const baseId = fieldPathId?.$id ?? id ?? 'locationField';
  const fieldPath = fieldPathId?.path ?? [];
  const actionsDisabled = disabled === true || readonly === true;

  const writeValue = (value: LocationFieldValue) => {
    onChange(value as Record<string, unknown>, fieldPath, undefined, baseId);
  };

  const writePoint = (lat: number, lng: number) => writeValue({ coordinates: createGeoJsonPoint(lat, lng) });
  // Absence, not `{ coordinates: null }`: a null failed schema validation and blocked Save (SPOTD-893). habit-hooks-disable non-essential-comment
  const clear = () => writeValue({});

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
      {isNotBlank(displayLabel) && (
        <Text variant="titleMedium" style={labelColor ? { color: labelColor } : undefined}>
          {displayLabel}
        </Text>
      )}

      <CoordinatePreview point={current} onClear={clear} disabled={actionsDisabled} />

      <View style={styles.buttonRow}>
        {/* Outlined like the map button: a filled button read as "a position is stored here" rather
            than as an action to take (SPOTD-893). Neither capture route is the primary one. */}
        <Button
          mode="outlined"
          icon="crosshairs-gps"
          style={styles.button}
          onPress={() => void captureViaGps()}
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

      {mapModalVisible && (
        <LocationPickerModal
          initialPoint={current}
          onConfirm={confirmMapPick}
          onCancel={() => setMapModalVisible(false)}
        />
      )}

      <Divider style={styles.divider} />
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
