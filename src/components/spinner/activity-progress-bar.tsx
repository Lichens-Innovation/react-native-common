import React, { type FunctionComponent } from 'react';
import { StyleSheet, View } from 'react-native';
import { Text } from 'react-native-paper';

import { useAppTheme } from '../../theme/theme';
import { ActivityProgressBarStats } from './activity-progress-bar-stats';
import { ActivityProgress } from './activity-progress.utils';

interface ActivityProgressBarProps {
  title: string;
  progress?: ActivityProgress;
  description?: string;
  shouldShowSpinner?: boolean;
}

export const ActivityProgressBar: FunctionComponent<ActivityProgressBarProps> = ({
  title,
  progress,
  description = '',
  shouldShowSpinner,
}) => {
  const styles = useStyles();

  return (
    <View style={styles.container}>
      <Text variant="bodySmall" style={styles.label}>
        {title}
      </Text>

      <ActivityProgressBarStats progress={progress} shouldShowSpinner={shouldShowSpinner} />

      <Text variant="bodySmall" style={styles.label}>
        {description}
      </Text>
    </View>
  );
};

const useStyles = () => {
  const theme = useAppTheme();

  return StyleSheet.create({
    container: {
      gap: theme.spacing(1),
    },
    label: {
      alignSelf: 'center',
    },
  });
};
