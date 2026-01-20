import { FunctionComponent } from 'react';
import { StyleSheet, View } from 'react-native';
import { Icon, Text } from 'react-native-paper';
import { useAppTheme } from '../../theme/theme';
import { SelectOption } from './drop-down-selector';

export type DropDownSelectorItemProps = {
  item: SelectOption;
  selected?: boolean;
  textColor: string;
};

export const DropDownSelectorItem: FunctionComponent<DropDownSelectorItemProps> = ({
  item,
  selected,
  textColor,
}) => {
  const isSelected = selected === true;
  const styles = useStyles({ isSelected });

  return (
    <View style={styles.itemContainer}>
      {item.icon && (
        <Icon source={item.icon} size={20} color={textColor} />
      )}
      <Text>{item.label}</Text>
    </View>
  );
};

type UseStylesProps = {
  isSelected: boolean;
};

const useStyles = ({ isSelected }: UseStylesProps) => {
  const theme = useAppTheme();

  return StyleSheet.create({
    itemContainer: {
      flexDirection: 'row',
      alignItems: 'center',
      paddingVertical: theme.spacing(1),
      paddingHorizontal: theme.spacing(1),
      gap: theme.spacing(1),
      backgroundColor: isSelected ? theme.colors.surfaceVariant : theme.colors.surface,
    },
  });
};
