import { useRef, useState, type FunctionComponent } from 'react';
import { StyleSheet, View, type LayoutChangeEvent } from 'react-native';
import { Gesture, GestureDetector } from 'react-native-gesture-handler';
import { Text } from 'react-native-paper';
import { useAppTheme } from '../../theme';
import { DrawingSvg } from './drawing-view';
import {
  DRAWING_ASPECT_RATIO,
  DRAWING_PAPER,
  appendStrokePoint,
  appendStrokeStart,
  toViewBoxPoint,
} from './drawing.utils';

type Size = { width: number; height: number };

/** The largest 3:1 box that fits the space: width-bound in portrait, height-bound in landscape. */
export const fitDrawingBox = ({ width, height }: Size): Size => {
  const boxWidth = Math.min(width, height * DRAWING_ASPECT_RATIO);
  return { width: boxWidth, height: boxWidth / DRAWING_ASPECT_RATIO };
};

export type DrawingPadProps = {
  /** The drawing so far, in viewBox units (see drawing.utils). */
  path: string;
  onChange: (path: string) => void;
  /** A line under the box, such as "Sign here". Its height is kept free when the box is sized. */
  caption?: string;
  testID?: string;
};

/** The room kept under the box for the caption: one line of body text plus its margin. */
const CAPTION_HEIGHT = 32;

/**
 * A white 3:1 surface to draw on with a finger. It fills the space it is given and centres the
 * largest 3:1 box in it, so it follows the device orientation; the path is kept in viewBox units, so
 * strokes drawn before a rotation survive it.
 *
 * Inside a React Native `Modal`, wrap it in its own `GestureHandlerRootView`: on Android a Modal is a
 * separate native window that the app's root view does not reach.
 */
export const DrawingPad: FunctionComponent<DrawingPadProps> = ({ path, onChange, caption, testID }) => {
  const theme = useAppTheme();
  const [box, setBox] = useState<Size>({ width: 0, height: 0 });
  // Touch events can arrive faster than renders: each one must extend the latest path, not the prop
  // of the last render.
  const pathRef = useRef(path);
  pathRef.current = path;

  const write = (next: string) => {
    pathRef.current = next;
    onChange(next);
  };

  const onLayout = (event: LayoutChangeEvent) => {
    const { width, height } = event.nativeEvent.layout;
    setBox(fitDrawingBox({ width, height: Math.max(height - (caption ? CAPTION_HEIGHT : 0), 0) }));
  };

  // minDistance(0): a tap is a stroke too, and leaves a dot.
  const pan = Gesture.Pan()
    .runOnJS(true)
    .minDistance(0)
    .maxPointers(1)
    .withTestId(testID ?? 'drawing-pad')
    .onBegin((e) => write(appendStrokeStart(pathRef.current, toViewBoxPoint(e.x, e.y, box.width, box.height))))
    .onUpdate((e) => write(appendStrokePoint(pathRef.current, toViewBoxPoint(e.x, e.y, box.width, box.height))));

  return (
    <View testID={testID ? `${testID}-area` : undefined} style={styles.area} onLayout={onLayout}>
      <GestureDetector gesture={pan}>
        <View
          testID={testID}
          style={[styles.pad, { width: box.width, height: box.height, borderColor: theme.colors.outline }]}
        >
          <View style={styles.baseline} pointerEvents="none" />
          <DrawingSvg path={path} />
        </View>
      </GestureDetector>
      {caption ? <Text style={styles.caption}>{caption}</Text> : null}
    </View>
  );
};

const styles = StyleSheet.create({
  area: { flex: 1, alignItems: 'center', justifyContent: 'center' },
  pad: { borderWidth: 1, borderRadius: 8, backgroundColor: DRAWING_PAPER, overflow: 'hidden' },
  caption: { marginTop: 8, height: CAPTION_HEIGHT - 8, textAlign: 'center', opacity: 0.6 },
  // A light line to sign on, at the height a signature usually sits.
  baseline: {
    position: 'absolute',
    left: '5%',
    right: '5%',
    bottom: '22%',
    height: 1,
    backgroundColor: '#c4c4c4',
  },
});
