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
import { ScrollView, StyleSheet, useWindowDimensions } from 'react-native';
import { Button, Dialog, Portal } from 'react-native-paper';
import { setClipboardTextContent } from '../../utils/clipboard.utils';
import { useSnackbar } from '../snack-bar/snackbar-provider';
import { SyntaxColoring } from '../syntax/syntax-coloring';
import { useDialogStyles } from './use-dialog-styles';
export const DialogSyntaxColorResult = (_a) => {
    var { icon, title, code, language, maxCodeLength, onClose, isVisible } = _a, dialogProps = __rest(_a, ["icon", "title", "code", "language", "maxCodeLength", "onClose", "isVisible"]);
    const styles = useStyles();
    const { showSnackbarMessage } = useSnackbar();
    const { t } = useTranslation();
    const hasIcon = !!icon;
    const hasTitle = !!title;
    const onCopy = () => {
        setClipboardTextContent(code);
        showSnackbarMessage(t('common:copiedToClipboard'));
    };
    if (!isVisible) {
        return null;
    }
    return (_jsx(Portal, { children: _jsxs(Dialog, Object.assign({ visible: true, onDismiss: onClose, style: styles.dialog }, dialogProps, { children: [hasIcon && _jsx(Dialog.Icon, { icon: icon }), hasTitle && _jsx(Dialog.Title, { children: title }), _jsx(Dialog.ScrollArea, { children: _jsx(ScrollView, { children: _jsx(SyntaxColoring, { code: code, language: language, maxCodeLength: maxCodeLength }) }) }), _jsxs(Dialog.Actions, { children: [_jsx(Button, { mode: "outlined", onPress: onCopy, icon: "content-copy", children: t('common:copy') }), _jsx(Button, { mode: "contained", onPress: onClose, children: t('common:close') })] })] })) }));
};
const useStyles = () => {
    const { width, alignSelf } = useDialogStyles();
    const { height } = useWindowDimensions();
    return StyleSheet.create({
        dialog: {
            maxHeight: height * 0.8,
            width,
            alignSelf,
        },
    });
};
//# sourceMappingURL=dialog-syntax-color-result.js.map