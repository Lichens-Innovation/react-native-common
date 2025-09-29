import { jsx as _jsx } from "react/jsx-runtime";
import { StyleSheet } from 'react-native';
import { Icon } from 'react-native-paper';
export const TabBarIcon = ({ name, color, size = 28 }) => {
    return _jsx(Icon, { source: name, size: size, color: color });
};
export const styles = StyleSheet.create({
    tabBarIcon: {
        marginBottom: 0,
    },
});
//# sourceMappingURL=tab-bar-icon.js.map