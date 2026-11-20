import type { WidgetProps } from '@rjsf/utils';
import { useEffect, type FunctionComponent } from 'react';
import { logger } from '../../../logger';
import { UNKNOWN_WIDGET_NAME_OPTION } from '../sanitize-ui-widgets';
import { UnsupportedFieldNotice } from '../unsupported-field-notice';

/** The name the template asked for, as far as the props still tell it. */
const requestedWidget = ({ options, schema }: WidgetProps): string => {
  const named = options?.[UNKNOWN_WIDGET_NAME_OPTION] ?? options?.widget ?? schema?.format;
  return typeof named === 'string' ? named : '<unnamed>';
};

/**
 * Stands in for a widget the app does not have (SPOTD-1346): the web builder's `ApiDropdownWidget` or
 * `PhotoWidget`, a typo, or one of rjsf's web-only default widgets the theme does not override (Email,
 * URL, Color, File, AltDate, AltDateTime, Rating).
 * It shows the "can't be displayed" notice and never writes a value; the rest of the sheet works.
 */
export const UnknownWidget: FunctionComponent<WidgetProps> = (props) => {
  const { id, label, schema } = props;
  const widget = requestedWidget(props);
  const title = label || (typeof schema?.title === 'string' ? schema.title : '') || id;

  // Once per mount: re-renders do not log again, but a field that remounts (a conditional branch or an
  // array item shown again, a language change) logs once more.
  useEffect(() => {
    logger.warn(`[rjsf] unknown widget "${widget}" on field ${id}: shown as not displayable`);
  }, [id, widget]);

  return <UnsupportedFieldNotice title={title} />;
};
