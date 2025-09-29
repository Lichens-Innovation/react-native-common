import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { useState } from 'react';
import { StyleSheet, View } from 'react-native';
import { Dropdown } from 'react-native-element-dropdown';
import { Text } from 'react-native-paper';
import { useAppTheme } from '../../theme/theme';
export const DropDownSelector = ({ label, value, onChange, isError, options, placeholder, searchPlaceholder, }) => {
    const theme = useAppTheme();
    const { primary, error } = theme.colors;
    const [isFocus, setIsFocus] = useState(false);
    const hasLabel = !!label;
    const styles = useStyles({ isFocus, hasLabel });
    return (_jsxs(View, { children: [hasLabel && (_jsx(Text, { variant: 'bodySmall', style: [styles.dropdownTitle, isFocus && { color: primary }, isError && { color: error }], children: label })), _jsx(Dropdown, { style: [styles.dropdown, isFocus && { borderColor: primary }, isError && { borderColor: error }], autoScroll: false, placeholderStyle: styles.placeholderStyle, selectedTextStyle: styles.selectedTextStyle, inputSearchStyle: styles.inputSearchStyle, iconStyle: styles.iconStyle, data: options, search: false, maxHeight: 300, labelField: "label", valueField: "value", placeholder: isFocus ? '' : placeholder, searchPlaceholder: searchPlaceholder, value: value, onFocus: () => setIsFocus(true), onBlur: () => setIsFocus(false), onChange: ({ value }) => {
                    onChange(value);
                    setIsFocus(false);
                } })] }));
};
const useStyles = ({ isFocus, hasLabel }) => {
    const theme = useAppTheme();
    return StyleSheet.create({
        dropdownTitle: {
            position: 'absolute',
            top: -theme.spacing(1),
            left: theme.spacing(1),
            backgroundColor: theme.colors.surface,
            paddingHorizontal: theme.spacing(0.75),
            color: theme.colors.onSurface,
            zIndex: 1,
        },
        dropdown: {
            height: 50,
            borderColor: isFocus ? theme.colors.primary : theme.colors.outline,
            borderWidth: isFocus ? 2 : 1,
            borderRadius: theme.roundness,
            paddingHorizontal: theme.spacing(1),
        },
        icon: {
            marginRight: 5,
        },
        placeholderStyle: {
            fontSize: 16,
            color: isFocus ? theme.colors.primary : theme.colors.secondary,
        },
        selectedTextStyle: {
            fontSize: 16,
            color: isFocus ? theme.colors.primary : theme.colors.secondary,
            paddingLeft: theme.spacing(1),
        },
        iconStyle: {
            width: 20,
            height: 20,
        },
        inputSearchStyle: {
            height: 40,
            fontSize: 16,
        },
    });
};
//# sourceMappingURL=drop-down-selector.js.map