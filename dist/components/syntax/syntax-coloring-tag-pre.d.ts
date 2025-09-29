import { type FunctionComponent, type ReactNode } from 'react';
import { type ViewStyle } from 'react-native';
interface PreTagProps {
    children: ReactNode;
    style?: ViewStyle;
    [key: string]: unknown;
}
export declare const PreTag: FunctionComponent<PreTagProps>;
export {};
