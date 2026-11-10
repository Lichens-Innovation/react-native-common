import { format } from 'date-fns';
import { filesize } from 'filesize';
import { FunctionComponent } from 'react';
import { Icon, IconButton, List } from 'react-native-paper';
import { FileInfo } from '../../services/files/native-file-system.types';
import { useAppTheme } from '../../theme/theme';
import { shareTextFile } from '../../utils/files/sharing.utils';

export interface LogFileListItemProps {
  file: FileInfo;
}

const describeLogFile = (file: FileInfo) => {
  const updatedAt = 'modificationTime' in file ? new Date(file.modificationTime ?? 0) : new Date();
  const formattedUpdatedAt = format(updatedAt, 'yyyy-MM-dd HH:mm:ss');
  const size = 'size' in file ? filesize(file.size ?? 0) : '';
  return `${formattedUpdatedAt} [ ${size} ]`;
};

export const LogFileListItem: FunctionComponent<LogFileListItemProps> = ({ file }) => {
  const theme = useAppTheme();

  return (
    <List.Item
      title={file.uri.split('/').pop()}
      description={describeLogFile(file)}
      left={(props) => <List.Icon {...props} icon={(props) => <Icon source="file-document" {...props} />} />}
      right={() => (
        <IconButton iconColor={theme.colors.primary} icon="share" onPress={() => void shareTextFile(file.uri)} />
      )}
    />
  );
};
