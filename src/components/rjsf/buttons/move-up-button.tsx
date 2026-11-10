import { TranslatableString } from '@rjsf/utils';
import type { FunctionComponent } from 'react';
import { IconButton } from 'react-native-paper';
import type { IconButtonProps } from './icon-button.types';

export const MoveUpButton: FunctionComponent<IconButtonProps> = ({ registry, onClick, disabled, title }) => {
  const label = registry.translateString(TranslatableString.MoveUpButton);
  return <IconButton icon="arrow-up" onPress={onClick} disabled={disabled} accessibilityLabel={title ?? label} />;
};
