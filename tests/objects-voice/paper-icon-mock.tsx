/* habit-hooks-disable non-essential-comment
 * react-native-paper has no icon font under Jest: every paper icon (including those inside modals that
 * bring their own PaperProvider) renders as a text node labelled "icon-<name>" instead, so tests can
 * find icons with getByLabelText and buttons by their accessible name.
 */
import { Text } from 'react-native';

interface MockIconProps {
  name: string;
}

const MockIcon = ({ name }: MockIconProps) => <Text accessibilityLabel={`icon-${name}`}>{name}</Text>;

export const paperIconMock = {
  __esModule: true,
  default: MockIcon,
  accessibilityProps: {},
};
