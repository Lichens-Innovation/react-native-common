import type { WidgetProps } from '@rjsf/utils';
import type { FunctionComponent } from 'react';
import { StyleSheet, View } from 'react-native';

const styles = StyleSheet.create({
  hidden: {
    display: 'none',
    height: 0,
    overflow: 'hidden',
  },
});

export const HiddenWidget: FunctionComponent<WidgetProps> = () => {
  return <View style={styles.hidden} />;
};
