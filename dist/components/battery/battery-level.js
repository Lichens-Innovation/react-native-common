import React from 'react';
import { Icon } from 'react-native-paper';
import { getBatteryColor, getBatteryIcon } from './battery.utils';
export const BatteryLevel = ({ batteryLevel, size = 32 }) => {
    const batteryColor = getBatteryColor(batteryLevel);
    const batteryIcon = getBatteryIcon(batteryLevel);
    return <Icon source={batteryIcon} size={size} color={batteryColor}/>;
};
//# sourceMappingURL=battery-level.js.map