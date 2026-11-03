import type { FunctionComponent } from 'react';
import { StyleSheet, View, type StyleProp, type ViewStyle } from 'react-native';
import { Text } from 'react-native-paper';
import Svg, { Path } from 'react-native-svg';
import { useAppTheme } from '../../theme';
import {
  DRAWING_ASPECT_RATIO,
  DRAWING_INK,
  DRAWING_PAPER,
  DRAWING_STROKE_WIDTH,
  DRAWING_VIEWBOX_ATTR,
  isEmptyPath,
} from './drawing.utils';

/** The SVG layer shared by the read-only view and the pad: one path, fixed ink, the fixed viewBox. */
export const DrawingSvg: FunctionComponent<{ path?: string | null }> = ({ path }) =>
  isEmptyPath(path) ? null : (
    <Svg
      width="100%"
      height="100%"
      viewBox={DRAWING_VIEWBOX_ATTR}
      preserveAspectRatio="xMidYMid meet"
      pointerEvents="none"
    >
      <Path
        d={path ?? ''}
        stroke={DRAWING_INK}
        strokeWidth={DRAWING_STROKE_WIDTH}
        fill="none"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </Svg>
  );

export type DrawingViewProps = {
  path?: string | null;
  /** Shown in the box when there is nothing drawn. */
  placeholder?: string;
  style?: StyleProp<ViewStyle>;
  testID?: string;
};

/** A read-only drawing in a white 3:1 box that fills the width it is given. */
export const DrawingView: FunctionComponent<DrawingViewProps> = ({ path, placeholder, style, testID }) => {
  const theme = useAppTheme();
  const empty = isEmptyPath(path);

  return (
    <View testID={testID} style={[styles.box, { borderColor: theme.colors.outline }, style]}>
      {empty && placeholder ? <Text style={styles.placeholder}>{placeholder}</Text> : null}
      <DrawingSvg path={path} />
    </View>
  );
};

const styles = StyleSheet.create({
  box: {
    width: '100%',
    aspectRatio: DRAWING_ASPECT_RATIO,
    borderWidth: 1,
    borderRadius: 8,
    backgroundColor: DRAWING_PAPER,
    alignItems: 'center',
    justifyContent: 'center',
    overflow: 'hidden',
  },
  // Grey on the white paper whatever the theme: the box itself does not follow dark mode.
  placeholder: { color: '#8a8a8a', fontStyle: 'italic' },
});
