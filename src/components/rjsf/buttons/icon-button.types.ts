import type { RjsfRegistryWithTranslate } from '@lichens-innovation/ts-common/rjsf';

export interface IconButtonProps {
  id?: string;
  onClick?: () => void;
  disabled?: boolean;
  readonly?: boolean;
  registry: RjsfRegistryWithTranslate;
  uiSchema?: Record<string, unknown>;
  title?: string;
}
