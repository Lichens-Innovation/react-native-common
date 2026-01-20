import { TabList, Tabs, TabSlot, TabTrigger } from 'expo-router/ui';
import { FunctionComponent } from 'react';
import { StyleSheet, ViewStyle } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useIsLandscape } from '../../../hooks/use-window-orientation';
import { useAppTheme } from '../../../theme/theme';
import { OrientationAwareTabButton } from './orientation-aware-tab-button';

export type TabItem = {
  name: string;
  href: string;
  title: string;
  icon: string;
};

export type OrientationAwareTabsLayoutProps = {
  tabs: TabItem[];
  activeColor?: string;
  containerStyle?: ViewStyle;
  tabListStyle?: ViewStyle;
};

export const OrientationAwareTabsLayout: FunctionComponent<OrientationAwareTabsLayoutProps> = ({
  tabs,
  activeColor,
  containerStyle,
  tabListStyle,
}) => {
  const theme = useAppTheme();
  const styles = useStyles();
  const isLandscape = useIsLandscape();

  return (
    <Tabs style={[styles.tabsContainer, containerStyle]}>
      <TabSlot style={styles.tabSlot} />
      <TabList style={[styles.tabList, tabListStyle]}>
        {tabs.map((tab) => (
          <TabTrigger key={tab.name} name={tab.name} href={tab.href} asChild>
            <OrientationAwareTabButton
              isLabelHidden={isLandscape}
              icon={tab.icon}
              title={tab.title}
              activeColor={activeColor ?? theme.colors.primary}
            />
          </TabTrigger>
        ))}
      </TabList>
    </Tabs>
  );
};

const useStyles = () => {
  const theme = useAppTheme();
  const { bottom, right } = useSafeAreaInsets();

  const minPadding = theme.spacing(0.5);
  const paddingBottom = Math.max(bottom, minPadding);
  const paddingRight = Math.max(right, minPadding);

  const isLandscape = useIsLandscape();

  return StyleSheet.create({
    tabsContainer: {
      flex: 1,
      flexDirection: isLandscape ? 'row' : 'column',
    },
    tabSlot: {
      flex: 1,
    },
    tabList: {
      backgroundColor: theme.colors.surfaceVariant,
      justifyContent: 'space-around',
      flexDirection: isLandscape ? 'column' : 'row',
      paddingBottom,
      paddingRight,
    }
  });
};

