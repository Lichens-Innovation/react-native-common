import { type FunctionComponent } from 'react';
import { StyleProp, ViewStyle } from 'react-native';
interface OnOffToggleProps {
    isOn: boolean;
    toggleState: (value: string) => void;
    style?: StyleProp<ViewStyle>;
}
export declare const OnOffToggle: FunctionComponent<OnOffToggleProps>;
export {};
