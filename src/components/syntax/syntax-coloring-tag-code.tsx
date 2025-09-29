import React, { type FunctionComponent, type ReactNode } from 'react';
import { ScrollView, StyleSheet, Text, type TextStyle } from 'react-native';
import { getMonospaceFontName } from '../../utils/font.utils';

interface CodeTagProps {
  children: ReactNode;
  style?: TextStyle;
  [key: string]: unknown;
}

export const CodeTag: FunctionComponent<CodeTagProps> = ({ children, style, ...props }) => {
  const styles = useStyles();
  return (
    <ScrollView horizontal={true}>
      <Text style={[styles.codeText, style]} {...props}>
        {children}
      </Text>
    </ScrollView>
  );
};

const useStyles = () => {
  return StyleSheet.create({
    codeText: {
      fontFamily: getMonospaceFontName(),
    },
  });
};
