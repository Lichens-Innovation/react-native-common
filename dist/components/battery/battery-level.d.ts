import { FunctionComponent } from 'react';
import { StyleProp, TextStyle } from 'react-native';
interface BatteryLevelProps {
    batteryLevel?: number | null;
    size?: number;
    style?: StyleProp<TextStyle>;
}
export declare const BatteryLevel: FunctionComponent<BatteryLevelProps>;
export {};
