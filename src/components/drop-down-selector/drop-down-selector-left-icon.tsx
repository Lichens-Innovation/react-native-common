import { FunctionComponent } from 'react';
import { Icon } from 'react-native-paper';

export type DropDownSelectorLeftIconProps = {
  icon?: string;
  color: string;
};

export const DropDownSelectorLeftIcon: FunctionComponent<DropDownSelectorLeftIconProps> = ({
  icon,
  color,
}) => {
  if (!icon) {
    return null;
  }

  return (
    <Icon source={icon} size={20} color={color} />
  );
};
