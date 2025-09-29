import { StyleSheet } from 'react-native';
import { Icon } from 'react-native-paper';

type IconLibrary =
  | 'AntDesign'
  | 'Entypo'
  | 'EvilIcons'
  | 'Feather'
  | 'FontAwesome'
  | 'FontAwesome5'
  | 'FontAwesome6'
  | 'Fontisto'
  | 'Foundation'
  | 'Ionicons'
  | 'MaterialCommunityIcons'
  | 'MaterialIcons'
  | 'Octicons'
  | 'SimpleLineIcons'
  | 'Zocial';

type IconProps = {
  library?: IconLibrary;
  name: string;
  color?: string;
  size?: number;
};

export const TabBarIcon = ({ name, color, size = 28 }: IconProps) => {
  return <Icon source={name} size={size} color={color} />;
};

export const styles = StyleSheet.create({
  tabBarIcon: {
    marginBottom: 0,
  },
});
