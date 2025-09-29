import { SafeAreaView, StyleSheet } from 'react-native';
import { useAnimateOnFocus } from '../../hooks/use-animate-on-focus';
export const SafeContainer = ({ children, style }) => {
    const isVisible = useAnimateOnFocus();
    if (!isVisible) {
        return null;
    }
    return <SafeAreaView style={[styles.container, style]}>{children}</SafeAreaView>;
};
const styles = StyleSheet.create({
    container: {
        flex: 1,
    },
});
//# sourceMappingURL=safe-container.windows.js.map