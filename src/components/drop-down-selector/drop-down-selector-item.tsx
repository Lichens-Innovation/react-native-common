import { isNotBlank } from '@lichens-innovation/ts-common';
import { FunctionComponent } from 'react';
import { StyleSheet, View } from 'react-native';
import { Text } from 'react-native-paper';
import { useAppTheme } from '../../theme/theme';
import { SelectOption } from './drop-down-selector';
import { DropDownSelectorLeftIcon } from './drop-down-selector-left-icon';

export interface DropDownSelectorItemProps {
  item: SelectOption;
  selected?: boolean;
  textColor: string;
}

export const DropDownSelectorItem: FunctionComponent<DropDownSelectorItemProps> = ({ item, selected, textColor }) => {
  const isSelected = selected === true;
  const styles = useStyles({ isSelected });

  return (
    <View style={styles.itemContainer}>
      {isNotBlank(item.icon) && <DropDownSelectorLeftIcon icon={item.icon} color={textColor} />}
      <Text style={{ color: textColor }}>{item.label}</Text>
    </View>
  );
};

interface UseStylesProps {
  isSelected: boolean;
}

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
