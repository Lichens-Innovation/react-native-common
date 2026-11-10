import type { WidgetProps } from '@rjsf/utils';

export const isWidgetDisplayOnly = ({ disabled, readonly }: Pick<WidgetProps, 'disabled' | 'readonly'>): boolean =>
  Boolean(disabled) || Boolean(readonly);
