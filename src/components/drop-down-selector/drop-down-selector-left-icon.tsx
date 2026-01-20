import { FunctionComponent } from 'react';
import { Icon } from 'react-native-paper';

export type DropDownSelectorLeftIconProps = {
  icon?: string;
  color: string;
  size?: number;
};

export const DropDownSelectorLeftIcon: FunctionComponent<DropDownSelectorLeftIconProps> = ({
  icon,
  color,
  size = 20,
}) => {
  if (!icon) {
    return null;
  }

  return (
    <Icon source={icon} size={size} color={color} />
  );
};
