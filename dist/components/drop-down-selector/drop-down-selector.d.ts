import { FunctionComponent } from 'react';
export interface SelectOption {
    label: string;
    value: string;
}
export type DropDownSelectorProps = {
    label?: string;
    value?: string;
    onChange: (code: string) => void;
    isError?: boolean;
    options: SelectOption[];
    placeholder?: string;
    searchPlaceholder?: string;
};
export declare const DropDownSelector: FunctionComponent<DropDownSelectorProps>;
