import { jsx as _jsx } from "react/jsx-runtime";
import { Icon } from 'react-native-paper';
import { getBatteryColor, getBatteryIcon } from './battery.utils';
export const BatteryLevel = ({ batteryLevel, size = 32 }) => {
    const batteryColor = getBatteryColor(batteryLevel);
    const batteryIcon = getBatteryIcon(batteryLevel);
    return _jsx(Icon, { source: batteryIcon, size: size, color: batteryColor });
};
//# sourceMappingURL=battery-level.js.map