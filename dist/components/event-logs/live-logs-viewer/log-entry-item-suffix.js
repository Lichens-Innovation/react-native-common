import { TextInput } from 'react-native-paper';
export const LogEntryItemSuffix = ({ filterText, onPress }) => {
    return <TextInput.Icon icon={filterText ? 'close' : 'magnify'} onPress={onPress}/>;
};
//# sourceMappingURL=log-entry-item-suffix.js.map