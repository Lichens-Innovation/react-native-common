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
import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { useTranslation } from 'react-i18next';
import { StyleSheet } from 'react-native';
import { Button, Dialog, Portal } from 'react-native-paper';
import { useDialogStyles } from './use-dialog-styles';
export const DialogCloseOnly = (_a) => {
    var { icon, title, content, onClose, isVisible } = _a, rest = __rest(_a, ["icon", "title", "content", "onClose", "isVisible"]);
    const { style: dialogStyleProp } = rest, dialogProps = __rest(rest, ["style"]);
    const styles = useStyles();
    const { t } = useTranslation();
    const hasIcon = !!icon;
    const hasTitle = !!title;
    const hasContent = !!content;
    if (!isVisible) {
        return null;
    }
    return (_jsx(Portal, { children: _jsxs(Dialog, Object.assign({ style: [styles.dialog, dialogStyleProp], visible: true, onDismiss: onClose }, dialogProps, { children: [hasIcon && _jsx(Dialog.Icon, { icon: icon }), hasTitle && _jsx(Dialog.Title, { children: title }), hasContent && _jsx(Dialog.Content, { children: content }), _jsx(Dialog.Actions, { children: _jsx(Button, { mode: "contained", onPress: onClose, children: t('common:close') }) })] })) }));
};
const useStyles = () => {
    const { width, alignSelf } = useDialogStyles();
    return StyleSheet.create({
        dialog: {
            width,
            alignSelf,
        },
    });
};
//# sourceMappingURL=dialog-close-only.js.map