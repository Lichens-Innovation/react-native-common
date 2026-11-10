import { type FunctionComponent, type PropsWithChildren } from 'react';
import { type SharedValue } from 'react-native-reanimated';
import { ResizablePaneDragChrome, type ResizablePaneDragGreyLevel } from './resizable-pane-drag-chrome';

export interface ResizablePaneContentProps extends PropsWithChildren {
  shouldObscureWhileResizing: boolean;
  isDragging: SharedValue<boolean>;
  isLayoutReady: SharedValue<boolean>;
  greyLevel: ResizablePaneDragGreyLevel;
}

export const ResizablePaneContent: FunctionComponent<ResizablePaneContentProps> = ({
  shouldObscureWhileResizing,
  isDragging,
  isLayoutReady,
  greyLevel,
  children,
}) => {
  if (!shouldObscureWhileResizing) {
    return <>{children}</>;
  }

  return (
    <ResizablePaneDragChrome isDragging={isDragging} isLayoutReady={isLayoutReady} greyLevel={greyLevel}>
      {children}
    </ResizablePaneDragChrome>
  );
};
