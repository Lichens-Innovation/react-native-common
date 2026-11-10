import { getRjsfDisplayLabel } from '@lichens-innovation/ts-common/rjsf';
import type { RJSFSchema, UiSchema } from '@rjsf/utils';

interface GetFieldDisplayLabelArgs {
  schema: RJSFSchema;
  uiSchema?: UiSchema;
  required?: boolean;
}

export const getFieldDisplayLabel = ({ schema, uiSchema, required }: GetFieldDisplayLabelArgs): string | undefined => {
  const label = typeof schema.title === 'string' ? schema.title : '';
  const hideLabel = uiSchema?.['ui:options']?.label === false;

  return getRjsfDisplayLabel({ label, required, hideLabel });
};
