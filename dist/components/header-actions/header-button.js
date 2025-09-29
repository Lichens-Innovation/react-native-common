import { StyleSheet } from 'react-native';
import { IconButton } from 'react-native-paper';
import { useAppTheme } from '../../theme/theme';
export const HeaderButton = ({ iconName, onPress }) => {
    const styles = useStyles();
    const theme = useAppTheme();
    return (<IconButton icon={iconName} size={25} iconColor={theme.colors.primary} style={styles.iconStyle} onPress={onPress}/>);
};
const useStyles = () => {
    const theme = useAppTheme();
    return StyleSheet.create({
        iconStyle: {
            marginHorizontal: theme.spacing(2),
        },
    });
};
//# sourceMappingURL=header-button.js.map