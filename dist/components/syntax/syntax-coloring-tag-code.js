var __rest = (this && this.__rest) || function (s, e) {
    var t = {};
    for (var p in s) if (Object.prototype.hasOwnProperty.call(s, p) && e.indexOf(p) < 0)
        t[p] = s[p];
    if (s != null && typeof Object.getOwnPropertySymbols === "function")
        for (var i = 0, p = Object.getOwnPropertySymbols(s); i < p.length; i++) {
            if (e.indexOf(p[i]) < 0 && Object.prototype.propertyIsEnumerable.call(s, p[i]))
                t[p[i]] = s[p[i]];
        }
    return t;
};
import { jsx as _jsx } from "react/jsx-runtime";
import { ScrollView, StyleSheet, Text } from 'react-native';
import { getMonospaceFontName } from '../../utils/font.utils';
export const CodeTag = (_a) => {
    var { children, style } = _a, props = __rest(_a, ["children", "style"]);
    const styles = useStyles();
    return (_jsx(ScrollView, { horizontal: true, children: _jsx(Text, Object.assign({ style: [styles.codeText, style] }, props, { children: children })) }));
};
const useStyles = () => {
    return StyleSheet.create({
        codeText: {
            fontFamily: getMonospaceFontName(),
        },
    });
};
//# sourceMappingURL=syntax-coloring-tag-code.js.map