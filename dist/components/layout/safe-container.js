import { jsx as _jsx } from "react/jsx-runtime";
import { SafeAreaView, StyleSheet } from 'react-native';
import Animated, { FadeInUp } from 'react-native-reanimated';
import { useAnimateOnFocus } from '../../hooks/use-animate-on-focus';
export const SafeContainer = ({ children, style, shouldAnimate = false }) => {
    const isVisible = useAnimateOnFocus();
    if (!isVisible) {
        return null;
    }
    return (_jsx(SafeAreaView, { style: [styles.container, style], children: _jsx(Animated.View, { style: styles.container, entering: shouldAnimate ? FadeInUp.duration(500) : undefined, children: children }) }));
};
const styles = StyleSheet.create({
    container: {
        flex: 1,
    },
});
//# sourceMappingURL=safe-container.js.map