import { mapEnumOptions } from '@lichens-innovation/ts-common/rjsf';
import type { WidgetProps } from '@rjsf/utils';
import { useCommitWidgetValue } from './use-commit-widget-value';
import { isWidgetDisplayOnly } from './widget-state.utils';
import { getWidgetTitle } from './widget-title.utils';

export const useEnumOptionsWidget = (props: WidgetProps) => ({
  commitValue: useCommitWidgetValue(props),
  isDisplayOnly: isWidgetDisplayOnly(props),
  widgetTitle: getWidgetTitle(props),
  enumOptions: mapEnumOptions(props.options),
});
