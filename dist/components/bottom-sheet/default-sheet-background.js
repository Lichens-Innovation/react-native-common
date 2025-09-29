import { View } from 'react-native';
import { useAppTheme } from '../../theme/theme';
export const DefaultSheetBackground = ({ style }) => {
    const { colors } = useAppTheme();
    return <View style={[style, { backgroundColor: colors.background }]}/>;
};
//# sourceMappingURL=default-sheet-background.js.map