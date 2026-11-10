import { TranslatableString } from '@rjsf/utils';
import type { FunctionComponent } from 'react';
import { IconButton } from 'react-native-paper';
import type { IconButtonProps } from './icon-button.types';

export const MoveDownButton: FunctionComponent<IconButtonProps> = ({ registry, onClick, disabled, title }) => {
  const label = registry.translateString(TranslatableString.MoveDownButton);
  return <IconButton icon="arrow-down" onPress={onClick} disabled={disabled} accessibilityLabel={title ?? label} />;
};
