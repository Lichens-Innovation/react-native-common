import type { FunctionComponent } from 'react';
import { useTranslation } from 'react-i18next';
import { StyleSheet, View } from 'react-native';
import { Button, Icon, Text } from 'react-native-paper';
import { useAppTheme } from '../../../theme/theme.index';
import { geoJsonPointToLatLng, type GeoJsonPoint } from '../../map/location-picker-modal';

interface CoordinatePreviewProps {
  point: GeoJsonPoint | null;
  onClear: () => void;
  disabled?: boolean;
}

export const CoordinatePreview: FunctionComponent<CoordinatePreviewProps> = ({ point, onClear, disabled }) => {
  const styles = useStyles();
  const theme = useAppTheme();
  const { t } = useTranslation();

  if (!point) {
    return (
      <Text variant="bodyMedium" style={styles.emptyText}>
        {t('common:location.noLocationCaptured')}
      </Text>
    );
  }

  const coord = geoJsonPointToLatLng(point);
  if (!coord) return null;

  return (
    <View style={styles.coordRow}>
      {/* Empty and captured states differed only by which grey line sat above the buttons; the check
          is what makes "a position is held here" survive a glance (SPOTD-893). */}
      <Icon source="check-circle" size={18} color={theme.colors.primary} />
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
  });
};
