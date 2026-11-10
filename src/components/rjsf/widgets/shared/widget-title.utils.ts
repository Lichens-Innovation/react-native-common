import { getRjsfDisplayLabel, getRjsfLabelColor } from '@lichens-innovation/ts-common/rjsf';
import type { WidgetProps } from '@rjsf/utils';
import type { RjsfDisplayLabelProps } from '../display-label';

type WidgetTitleSource = Pick<WidgetProps, 'label' | 'required' | 'hideLabel' | 'options'>;

export const getWidgetTitle = ({ label, required, hideLabel, options }: WidgetTitleSource): RjsfDisplayLabelProps => ({
  label: getRjsfDisplayLabel({ label, required, hideLabel }),
  color: getRjsfLabelColor(options),
});
