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
import { StyleSheet } from 'react-native';
import { Button, Dialog, Portal, Text } from 'react-native-paper';
import { useDialogStyles } from './use-dialog-styles';
export const DialogOkCancel = (_a) => {
    var { icon, title, description, onOk, onCancel, isVisible } = _a, rest = __rest(_a, ["icon", "title", "description", "onOk", "onCancel", "isVisible"]);
    const { style: dialogStyleProp } = rest, dialogProps = __rest(rest, ["style"]);
    const styles = useStyles();
    const { t } = useTranslation();
    const hasIcon = !!icon;
    const hasTitle = !!title;
    const hasTitleString = typeof title === 'string';
    const hasDescription = !!description;
    const hasDescriptionString = typeof description === 'string';
    if (!isVisible) {
        return null;
    }
    return (<Portal>
      <Dialog style={[styles.dialog, dialogStyleProp]} visible={true} onDismiss={onCancel} {...dialogProps}>
        {hasIcon && <Dialog.Icon icon={icon}/>}

        {hasTitle && <Dialog.Title>{hasTitleString ? <Text>{title}</Text> : title}</Dialog.Title>}

        {hasDescription && (<Dialog.Content>{hasDescriptionString ? <Text>{description}</Text> : description}</Dialog.Content>)}

        <Dialog.Actions>
          <Button onPress={onCancel}>{t('common:cancel')}</Button>
          <Button style={styles.button} mode="contained" onPress={onOk}>
            {t('common:ok')}
          </Button>
        </Dialog.Actions>
      </Dialog>
    </Portal>);
};
const useStyles = () => {
    const { width, alignSelf } = useDialogStyles();
    return StyleSheet.create({
        button: {
            width: 60,
        },
        dialog: {
            width,
            alignSelf,
        },
    });
};
//# sourceMappingURL=dialog-ok-cancel.js.map