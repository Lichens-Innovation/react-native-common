import { useIsFocused } from '@react-navigation/native';
import { FunctionComponent, PropsWithChildren } from 'react';
import { SafeAreaView, StyleSheet, ViewStyle } from 'react-native';

type SafeContainerProps = PropsWithChildren<{
  style?: ViewStyle;
  shouldAnimate?: boolean;
}>;

export const SafeContainer: FunctionComponent<SafeContainerProps> = ({ children, style }) => {
  const isScreenFocused = useIsFocused();
  if (!isScreenFocused) {
    return null;
  }

  return <SafeAreaView style={[styles.container, style]}>{children}</SafeAreaView>;
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
});
