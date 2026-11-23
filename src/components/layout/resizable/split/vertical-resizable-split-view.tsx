import { type FunctionComponent } from 'react';
import { useDevPropsValidation } from '../use-dev-props-validation';
import { VerticalResizableSplitViewProps } from './vertical-resizable-split-view.types';
import { validateResizableSplitViewProps } from './vertical-resizable-split-view.utils';
import { ResizableSplitView } from './resizable-split-view';

export const VerticalResizableSplitView: FunctionComponent<VerticalResizableSplitViewProps> = (props) => {
  useDevPropsValidation(props, validateResizableSplitViewProps);

  const {
    topContent,
    bottomContent,
    initialTopRatio = 0.5,
    minTopRatio = 0.15,
    maxTopRatio = 0.85,
    hideHandle = false,
    shouldObscureTopPaneContentWhileResizing = false,
    shouldObscureBottomPaneContentWhileResizing = false,
    ...handleStyles
  } = props;

  return (
    <ResizableSplitView
      axis="y"
      firstContent={topContent}
      secondContent={bottomContent}
      initialRatio={initialTopRatio}
      minRatio={minTopRatio}
      maxRatio={maxTopRatio}
      hideHandle={hideHandle}
      shouldObscureFirstPaneContentWhileResizing={shouldObscureTopPaneContentWhileResizing}
      shouldObscureSecondPaneContentWhileResizing={shouldObscureBottomPaneContentWhileResizing}
      {...handleStyles}
    />
  );
};
