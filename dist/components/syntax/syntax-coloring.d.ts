import { type FunctionComponent } from 'react';
interface SyntaxColoringProps {
    code: string;
    language: string;
    maxCodeLength?: number;
}
export declare const SyntaxColoring: FunctionComponent<SyntaxColoringProps>;
export {};
