import { type FunctionComponent } from 'react';
import { useDevPropsValidation } from '../use-dev-props-validation';
import { HorizontalResizableSplitViewProps } from './horizontal-resizable-split-view.types';
import { validateResizableSplitViewProps } from './horizontal-resizable-split-view.utils';
import { ResizableSplitView } from './resizable-split-view';

export const HorizontalResizableSplitView: FunctionComponent<HorizontalResizableSplitViewProps> = (props) => {
  useDevPropsValidation(props, validateResizableSplitViewProps);

  const {
    leftContent,
    rightContent,
    initialLeftRatio = 0.5,
    minLeftRatio = 0.15,
    maxLeftRatio = 0.85,
    hideHandle = false,
    shouldObscureLeftPaneContentWhileResizing = false,
    shouldObscureRightPaneContentWhileResizing = false,
    ...handleStyles
  } = props;

  return (
    <ResizableSplitView
      axis="x"
      firstContent={leftContent}
      secondContent={rightContent}
      initialRatio={initialLeftRatio}
      minRatio={minLeftRatio}
      maxRatio={maxLeftRatio}
      hideHandle={hideHandle}
      shouldObscureFirstPaneContentWhileResizing={shouldObscureLeftPaneContentWhileResizing}
      shouldObscureSecondPaneContentWhileResizing={shouldObscureRightPaneContentWhileResizing}
      {...handleStyles}
    />
  );
};
