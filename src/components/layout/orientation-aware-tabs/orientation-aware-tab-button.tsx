import { TabTriggerSlotProps } from 'expo-router/ui';
import { FunctionComponent } from 'react';
import { Pressable, StyleSheet } from 'react-native';
import { Text } from 'react-native-paper';
import { useIsLandscape } from '../../../hooks/use-window-orientation';
import { useAppTheme } from '../../../theme/theme';
import { TabBarIcon } from '../../tab-bar-icon';

export type OrientationAwareTabButtonProps = TabTriggerSlotProps & {
  icon: string;
  title: string;
  activeColor: string;
  isLabelHidden?: boolean;
};

export const OrientationAwareTabButton: FunctionComponent<OrientationAwareTabButtonProps> = ({
  icon,
  title,
  activeColor,
  isFocused,
  isLabelHidden = false,
  ...props
}) => {
  const styles = useStyles();
  const isLabelVisible: boolean = !isLabelHidden;

  return (
    <Pressable {...props} style={[styles.tabButton]} >
      <TabBarIcon name={icon} color={isFocused ? activeColor : undefined} />

      {isLabelVisible && (
        <Text variant="labelSmall" style={[isFocused && { color: activeColor }]}>
          {title}
        </Text>
      )}
    </Pressable>
  );
};

const useStyles = () => {
  const theme = useAppTheme();
  const isLandscape = useIsLandscape();
  const padding = theme.spacing(0.5);

  return StyleSheet.create({
    tabButton: {
      flex: 1,
      alignItems: 'center',
      justifyContent: 'center',
      paddingLeft: isLandscape ? padding : 0,
      paddingTop: isLandscape ? 0 : padding,
      gap: theme.spacing(0.5),
    },
  });
};