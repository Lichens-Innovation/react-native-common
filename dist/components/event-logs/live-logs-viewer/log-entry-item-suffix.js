import { jsx as _jsx } from "react/jsx-runtime";
import { TextInput } from 'react-native-paper';
export const LogEntryItemSuffix = ({ filterText, onPress }) => {
    return _jsx(TextInput.Icon, { icon: filterText ? 'close' : 'magnify', onPress: onPress });
};
//# sourceMappingURL=log-entry-item-suffix.js.map