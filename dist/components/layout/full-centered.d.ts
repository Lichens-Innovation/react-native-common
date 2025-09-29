import { PropsWithChildren, type FunctionComponent } from 'react';
import { ViewStyle } from 'react-native';
interface FullCenteredProps extends PropsWithChildren {
    style?: ViewStyle;
}
export declare const FullCentered: FunctionComponent<FullCenteredProps>;
export {};
