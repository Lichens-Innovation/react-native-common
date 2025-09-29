import React, { PropsWithChildren, type FunctionComponent } from 'react';
import { View, ViewStyle } from 'react-native';

interface FullCenteredProps extends PropsWithChildren {
  style?: ViewStyle;
}

export const FullCentered: FunctionComponent<FullCenteredProps> = ({ children, style }) => (
  <View style={[style, { flex: 1, justifyContent: 'center', alignItems: 'center' }]}>{children}</View>
);
