import { FunctionComponent } from 'react';
import { TextInput } from 'react-native-paper';

interface LogEntryItemSuffixProps {
  filterText: string;
  onPress: () => void;
}

export const LogEntryItemSuffix: FunctionComponent<LogEntryItemSuffixProps> = ({ filterText, onPress }) => {
  return <TextInput.Icon icon={filterText ? 'close' : 'magnify'} onPress={onPress} />;
};
