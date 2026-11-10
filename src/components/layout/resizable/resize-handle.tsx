import { type ComponentProps, type FunctionComponent } from 'react';
import { StyleSheet, type StyleProp, type ViewStyle } from 'react-native';
import { type Gesture, GestureDetector } from 'react-native-gesture-handler';
import Animated, { type SharedValue, useAnimatedStyle, withSpring } from 'react-native-reanimated';
import { useAppTheme } from '../../../theme/theme.index';
import { RESIZE_HANDLE } from './resizable-view.constants';

type ResizeHandleBarOrientation = 'horizontal' | 'vertical';

export interface ResizeHandleProps {
  gesture: ReturnType<typeof Gesture.Pan>;
  isDragging: SharedValue<boolean>;
  barOrientation: ResizeHandleBarOrientation;
  containerStyle: ComponentProps<typeof Animated.View>['style'];
  handleStyle?: StyleProp<ViewStyle>;
}

export const ResizeHandle: FunctionComponent<ResizeHandleProps> = ({
  gesture,
  isDragging,
  barOrientation,
  containerStyle,
  handleStyle,
}) => {
  const styles = useStyles(barOrientation);

  const dragHandleAnimatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: withSpring(isDragging.value ? 1.2 : 1, RESIZE_HANDLE.dragSpringConfig) }],
  }));

  return (
    <GestureDetector gesture={gesture}>
      <Animated.View style={containerStyle}>
        <Animated.View style={[styles.handle, handleStyle, dragHandleAnimatedStyle]} />
      </Animated.View>
    </GestureDetector>
  );
};

const useStyles = (barOrientation: ResizeHandleBarOrientation) => {
  const theme = useAppTheme();
  const thickness = theme.spacing(RESIZE_HANDLE.thicknessSpacing);
  const isVerticalBar = barOrientation === 'vertical';

  return StyleSheet.create({
    handle: {
      width: isVerticalBar ? thickness : RESIZE_HANDLE.length,
      height: isVerticalBar ? RESIZE_HANDLE.length : thickness,
      backgroundColor: theme.colors.primary,
      borderRadius: theme.roundness,
      borderWidth: StyleSheet.hairlineWidth,
      borderColor: theme.colors.outline,
    },
  });
};
