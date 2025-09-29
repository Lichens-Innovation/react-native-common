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
import React, { useEffect, useState } from 'react';
import { DialogCloseOnly } from '../dialogs/dialog-close-only';
import { BarcodeScanner } from './barcode-scanner';
import { getPermissionMessage, requestCameraPermissions } from './barcode-scanner.utils';
export const BarcodeScannerDialog = (_a) => {
    var { isVisible, title, onClose, onBarcodeScanned } = _a, rest = __rest(_a, ["isVisible", "title", "onClose", "onBarcodeScanned"]);
    const [hasPermission, setHasPermission] = useState();
    useEffect(() => {
        requestCameraPermissions().then(setHasPermission);
    }, []);
    if (!isVisible) {
        return null;
    }
    if (!hasPermission) {
        const message = getPermissionMessage(hasPermission);
        return <DialogCloseOnly isVisible={true} title={title} onClose={onClose} content={message} {...rest}/>;
    }
    return (<DialogCloseOnly isVisible={true} title={title} onClose={onClose} content={<BarcodeScanner onBarcodeScanned={onBarcodeScanned}/>} {...rest}/>);
};
//# sourceMappingURL=barcode-scanner-dialog.js.map