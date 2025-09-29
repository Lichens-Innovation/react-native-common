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
    return (<Portal>
      <Dialog visible={true} onDismiss={onClose} style={styles.dialog} {...dialogProps}>
        {hasIcon && <Dialog.Icon icon={icon}/>}
        {hasTitle && <Dialog.Title>{title}</Dialog.Title>}

        <Dialog.ScrollArea>
          <ScrollView>
            <SyntaxColoring code={code} language={language} maxCodeLength={maxCodeLength}/>
          </ScrollView>
        </Dialog.ScrollArea>

        <Dialog.Actions>
          <Button mode="outlined" onPress={onCopy} icon="content-copy">
            {t('common:copy')}
          </Button>
          <Button mode="contained" onPress={onClose}>
            {t('common:close')}
          </Button>
        </Dialog.Actions>
      </Dialog>
    </Portal>);
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