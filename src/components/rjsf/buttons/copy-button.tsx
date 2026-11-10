import { TranslatableString } from '@rjsf/utils';
import type { FunctionComponent } from 'react';
import { IconButton } from 'react-native-paper';
import type { IconButtonProps } from './icon-button.types';

export const CopyButton: FunctionComponent<IconButtonProps> = ({ registry, onClick, disabled, title }) => {
  const label = registry.translateString(TranslatableString.CopyButton);
  return <IconButton icon="content-copy" onPress={onClick} disabled={disabled} accessibilityLabel={title ?? label} />;
};
