import { isBlank } from '@lichens-innovation/ts-common';
import { FunctionComponent } from 'react';
import { Icon } from 'react-native-paper';

export interface DropDownSelectorLeftIconProps {
  icon?: string;
  color: string;
  size?: number;
}

export const DropDownSelectorLeftIcon: FunctionComponent<DropDownSelectorLeftIconProps> = ({
  icon,
  color,
  size = 20,
}) => {
  if (isBlank(icon)) {
    return null;
  }

  return <Icon source={icon} size={size} color={color} />;
};
