import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { StyleSheet, View } from 'react-native';
import { Text } from 'react-native-paper';
import { useAppTheme } from '../../theme/theme';
import { ActivityProgressBarStats } from './activity-progress-bar-stats';
export const ActivityProgressBar = ({ title, progress, description = '', shouldShowSpinner, }) => {
    const styles = useStyles();
    return (_jsxs(View, { style: styles.container, children: [_jsx(Text, { variant: "bodySmall", style: styles.label, children: title }), _jsx(ActivityProgressBarStats, { progress: progress, shouldShowSpinner: shouldShowSpinner }), _jsx(Text, { variant: "bodySmall", style: styles.label, children: description })] }));
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