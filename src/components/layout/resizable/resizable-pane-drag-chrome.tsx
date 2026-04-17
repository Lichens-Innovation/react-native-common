import { type FunctionComponent, type PropsWithChildren } from 'react';
import { StyleSheet } from 'react-native';
import Animated, { type SharedValue, useAnimatedProps, useAnimatedStyle } from 'react-native-reanimated';
import { useAppTheme } from '../../../theme';

export type ResizablePaneDragGreyLevel = 'primary' | 'secondary';

export type ResizablePaneDragChromeProps = PropsWithChildren<{
  isDragging: SharedValue<boolean>;
  isLayoutReady: SharedValue<boolean>;
  greyLevel: ResizablePaneDragGreyLevel;
}>;

type MaskPointerEvents = 'box-only' | 'none';

/**
 * Absolute-fill mask above pane children: animates to opaque while dragging or before layout is ready.
 * Children stay mounted at full opacity; visibility is blocked by the overlay, not by fading the content.
 * pointerEvents lets touches pass through when the mask is inactive.
 */
export const ResizablePaneDragChrome: FunctionComponent<ResizablePaneDragChromeProps> = ({
  isDragging,
  isLayoutReady,
  greyLevel,
  children,
}) => {
  const { colors } = useAppTheme();
  const backgroundColor = greyLevel === 'primary' ? colors.surface : colors.surfaceVariant;

  const maskAnimatedStyle = useAnimatedStyle(() => ({
    opacity: isDragging.value || !isLayoutReady.value ? 1 : 0,
  }));

  const maskAnimatedProps = useAnimatedProps(() => {
    const isMaskActive = isDragging.value || !isLayoutReady.value;
    return { pointerEvents: (isMaskActive ? 'box-only' : 'none') as MaskPointerEvents };
  });

  return (
    <>
      {children}

      <Animated.View
        style={[StyleSheet.absoluteFill, { backgroundColor }, maskAnimatedStyle]}
        animatedProps={maskAnimatedProps}
      />
    </>
  );
};
