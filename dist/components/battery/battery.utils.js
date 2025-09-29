import { getColorForPercentage } from '../../utils/color.utils';
import { isNullish } from '../../utils/types.utils';
export const getBatteryIcon = (level) => {
    if (isNullish(level))
        return 'battery-alert-variant-outline';
    if (level >= 90)
        return 'battery';
    if (level >= 75)
        return 'battery-60';
    if (level >= 60)
        return 'battery-50';
    if (level >= 45)
        return 'battery-40';
    if (level >= 30)
        return 'battery-30';
    if (level >= 15)
        return 'battery-20';
    if (level > 0)
        return 'battery-10';
    return 'battery-arrow-down-outline';
};
export const getBatteryColor = (batteryLevel) => {
    return isNullish(batteryLevel) ? 'gray' : getColorForPercentage(batteryLevel / 100);
};
//# sourceMappingURL=battery.utils.js.map