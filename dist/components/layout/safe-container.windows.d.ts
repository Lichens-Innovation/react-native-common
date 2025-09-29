import { FunctionComponent, PropsWithChildren } from 'react';
import { ViewStyle } from 'react-native';
type SafeContainerProps = PropsWithChildren<{
    style?: ViewStyle;
    shouldAnimate?: boolean;
}>;
export declare const SafeContainer: FunctionComponent<SafeContainerProps>;
export {};
