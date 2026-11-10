import React, { type FunctionComponent, type PropsWithChildren } from 'react';
import { ScrollView, type ViewStyle } from 'react-native';

interface PreTagProps extends PropsWithChildren {
  style?: ViewStyle;
  [key: string]: unknown;
}

export const PreTag: FunctionComponent<PreTagProps> = ({ children, style, ...props }) => (
  <ScrollView horizontal={true} style={style} {...props}>
    {children}
  </ScrollView>
);
