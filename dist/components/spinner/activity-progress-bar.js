import React from 'react';
import { StyleSheet, View } from 'react-native';
import { Text } from 'react-native-paper';
import { useAppTheme } from '../../theme/theme';
import { ActivityProgressBarStats } from './activity-progress-bar-stats';
export const ActivityProgressBar = ({ title, progress, description = '', shouldShowSpinner, }) => {
    const styles = useStyles();
    return (<View style={styles.container}>
      <Text variant="bodySmall" style={styles.label}>
        {title}
      </Text>

      <ActivityProgressBarStats progress={progress} shouldShowSpinner={shouldShowSpinner}/>

      <Text variant="bodySmall" style={styles.label}>
        {description}
      </Text>
    </View>);
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
//# sourceMappingURL=activity-progress-bar.js.map