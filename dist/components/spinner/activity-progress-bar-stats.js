import { jsx as _jsx, jsxs as _jsxs, Fragment as _Fragment } from "react/jsx-runtime";
import { StyleSheet, View } from 'react-native';
import { ActivityIndicator, ProgressBar, Text } from 'react-native-paper';
import { useAppTheme } from '../../theme/theme';
import { computeActivityProgress } from './activity-progress.utils';
export const ActivityProgressBarStats = ({ progress, shouldShowSpinner = false, }) => {
    const styles = useStyles();
    const { percentage, stats } = computeActivityProgress(progress);
    if (shouldShowSpinner) {
        return _jsx(ActivityIndicator, {});
    }
    return (_jsxs(_Fragment, { children: [_jsx(ProgressBar, { progress: percentage / 100, style: styles.progressBar }), _jsxs(View, { style: styles.statsContainer, children: [_jsx(Text, { variant: "bodySmall", children: stats }), _jsxs(Text, { variant: "bodySmall", children: [percentage.toFixed(0), "%"] })] })] }));
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
//# sourceMappingURL=activity-progress-bar-stats.js.map