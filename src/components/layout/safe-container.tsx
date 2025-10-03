import { FunctionComponent, PropsWithChildren } from 'react';
import { StyleSheet, ViewStyle } from 'react-native';
import Animated, { FadeInUp } from 'react-native-reanimated';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useAnimateOnFocus } from '../../hooks/use-animate-on-focus';

type SafeContainerProps = PropsWithChildren<{
  style?: ViewStyle;
  shouldAnimate?: boolean;
}>;

export const SafeContainer: FunctionComponent<SafeContainerProps> = ({ children, style, shouldAnimate = false }) => {
  const isVisible = useAnimateOnFocus();
  if (!isVisible) {
    return null;
  }

  return (
    <SafeAreaView style={[styles.container, style]}>
      <Animated.View style={styles.container} entering={shouldAnimate ? FadeInUp.duration(500) : undefined}>
        {children}
      </Animated.View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
});
