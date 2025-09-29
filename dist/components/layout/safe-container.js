import { SafeAreaView, StyleSheet } from 'react-native';
import Animated, { FadeInUp } from 'react-native-reanimated';
import { useAnimateOnFocus } from '../../hooks/use-animate-on-focus';
export const SafeContainer = ({ children, style, shouldAnimate = false }) => {
    const isVisible = useAnimateOnFocus();
    if (!isVisible) {
        return null;
    }
    return (<SafeAreaView style={[styles.container, style]}>
      <Animated.View style={styles.container} entering={shouldAnimate ? FadeInUp.duration(500) : undefined}>
        {children}
      </Animated.View>
    </SafeAreaView>);
};
const styles = StyleSheet.create({
    container: {
        flex: 1,
    },
});
//# sourceMappingURL=safe-container.js.map