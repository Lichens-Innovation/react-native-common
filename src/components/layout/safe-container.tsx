import { useIsFocused } from '@react-navigation/native';
import { FunctionComponent, PropsWithChildren } from 'react';
import { StyleSheet, ViewStyle } from 'react-native';
import Animated, { FadeInUp } from 'react-native-reanimated';
import { SafeAreaView } from 'react-native-safe-area-context';

type SafeContainerProps = PropsWithChildren<{
  style?: ViewStyle;
  shouldAnimate?: boolean;
}>;

export const SafeContainer: FunctionComponent<SafeContainerProps> = ({ children, style, shouldAnimate = false }) => {
  const isScreenFocused = useIsFocused();
  if (!isScreenFocused) {
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
