import { type ComponentProps, type FunctionComponent, type ReactNode } from 'react';
import Animated, { type SharedValue } from 'react-native-reanimated';
import { ResizablePaneContent } from './resizable-pane-content';
import { type ResizablePaneDragGreyLevel } from './resizable-pane-drag-chrome';

export interface ResizablePane {
  content: ReactNode;
  style: ComponentProps<typeof Animated.View>['style'];
  shouldObscureWhileResizing: boolean;
}

interface ResizablePaneSlotProps {
  pane: ResizablePane;
  greyLevel: ResizablePaneDragGreyLevel;
  isDragging: SharedValue<boolean>;
  isLayoutReady: SharedValue<boolean>;
}

export const ResizablePaneSlot: FunctionComponent<ResizablePaneSlotProps> = ({
  pane,
  greyLevel,
  isDragging,
  isLayoutReady,
}) => (
  <Animated.View style={pane.style}>
    <ResizablePaneContent
      shouldObscureWhileResizing={pane.shouldObscureWhileResizing}
      isDragging={isDragging}
      isLayoutReady={isLayoutReady}
      greyLevel={greyLevel}
    >
      {pane.content}
    </ResizablePaneContent>
  </Animated.View>
);
