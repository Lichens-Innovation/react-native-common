import React, { type FunctionComponent } from 'react';
import { StyleSheet, View } from 'react-native';
import { ActivityIndicator, ProgressBar, Text } from 'react-native-paper';

import { useAppTheme } from '../../theme/theme';
import { ActivityProgress, computeActivityProgress } from './activity-progress.utils';

interface ActivityProgressBarStatsProps {
  progress?: ActivityProgress;
  shouldShowSpinner?: boolean;
}

export const ActivityProgressBarStats: FunctionComponent<ActivityProgressBarStatsProps> = ({
  progress,
  shouldShowSpinner = false,
}) => {
  const styles = useStyles();
  const { percentage, stats } = computeActivityProgress(progress);

  if (shouldShowSpinner) {
    return <ActivityIndicator />;
  }

  return (
    <>
      <ProgressBar progress={percentage / 100} style={styles.progressBar} />

      <View style={styles.statsContainer}>
        <Text variant="bodySmall">{stats}</Text>
        <Text variant="bodySmall">{percentage.toFixed(0)}%</Text>
      </View>
    </>
  );
};

const useStyles = () => {
  const theme = useAppTheme();

  return StyleSheet.create({
    progressBar: {
      height: 8,
      borderRadius: theme.roundness,
    },
    statsContainer: {
      flexDirection: 'row',
      justifyContent: 'space-between',
    },
  });
};
