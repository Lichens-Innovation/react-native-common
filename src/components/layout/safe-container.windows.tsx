import { FunctionComponent, PropsWithChildren } from 'react';
import { SafeAreaView, StyleSheet, ViewStyle } from 'react-native';
import { useAnimateOnFocus } from '../../hooks/use-animate-on-focus';

type SafeContainerProps = PropsWithChildren<{
  style?: ViewStyle;
  shouldAnimate?: boolean;
}>;

export const SafeContainer: FunctionComponent<SafeContainerProps> = ({ children, style }) => {
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
