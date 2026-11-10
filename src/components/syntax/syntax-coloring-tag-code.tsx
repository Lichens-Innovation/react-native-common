import React, { type FunctionComponent, type PropsWithChildren } from 'react';
import { ScrollView, StyleSheet, Text, type TextStyle } from 'react-native';
import { getMonospaceFontName } from '../../utils/device/font.utils';

interface CodeTagProps extends PropsWithChildren {
  style?: TextStyle;
  [key: string]: unknown;
}

export const CodeTag: FunctionComponent<CodeTagProps> = ({ children, style, ...props }) => {
  return (
    <ScrollView horizontal={true}>
      <Text style={[styles.codeText, style]} {...props}>
        {children}
      </Text>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  codeText: {
    fontFamily: getMonospaceFontName(),
  },
});
