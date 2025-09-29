import { type FunctionComponent, type ReactNode } from 'react';
import { type TextStyle } from 'react-native';
interface CodeTagProps {
    children: ReactNode;
    style?: TextStyle;
    [key: string]: unknown;
}
export declare const CodeTag: FunctionComponent<CodeTagProps>;
export {};
