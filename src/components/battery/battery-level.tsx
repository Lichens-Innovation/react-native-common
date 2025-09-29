import React, { FunctionComponent } from 'react';
import { StyleProp, TextStyle } from 'react-native';
import { Icon } from 'react-native-paper';
import { getBatteryColor, getBatteryIcon } from './battery.utils';

interface BatteryLevelProps {
  batteryLevel?: number | null;
  size?: number;
  style?: StyleProp<TextStyle>;
}

export const BatteryLevel: FunctionComponent<BatteryLevelProps> = ({ batteryLevel, size = 32 }) => {
  const batteryColor = getBatteryColor(batteryLevel);
  const batteryIcon = getBatteryIcon(batteryLevel);

  return <Icon source={batteryIcon} size={size} color={batteryColor} />;
};
