import { TabList, Tabs, TabSlot, TabTrigger } from 'expo-router/ui';
import { FunctionComponent } from 'react';
import { StyleSheet, ViewStyle } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useScreenOrientation } from '../../../hooks/use-screen-orientation';
import { useAppTheme } from '../../../theme';
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
  const { isLandscape, isLandscapeLeft } = useScreenOrientation();
  const styles = useStyles({ isLandscape, isLandscapeLeft });

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

type UseOrientationAwareTabsStylesParams = {
  isLandscape: boolean;
  isLandscapeLeft: boolean;
};

const useStyles = ({ isLandscape, isLandscapeLeft }: UseOrientationAwareTabsStylesParams) => {
  const theme = useAppTheme();
  const { bottom, left, right } = useSafeAreaInsets();

  const minPadding = theme.spacing(0.5);

  const maxHorizontalInset = Math.max(left, right, minPadding);
  const landscapeRightPadding = isLandscapeLeft ? maxHorizontalInset : minPadding;

  return StyleSheet.create({
    tabsContainer: {
      flex: 1,
      flexDirection: isLandscape ? 'row' : 'column',
    },
    tabSlot: {
      flex: 1,
    },
    tabList: {
      backgroundColor: theme.colors.elevation.level1,
      justifyContent: 'space-around',
      flexDirection: isLandscape ? 'column' : 'row',
      paddingBottom: isLandscape ? minPadding : bottom,
      paddingRight: isLandscape ? landscapeRightPadding : minPadding,
      borderTopWidth: isLandscape ? undefined : StyleSheet.hairlineWidth,
      borderTopColor: isLandscape ? undefined : theme.colors.outline,
      borderLeftWidth: isLandscape ? StyleSheet.hairlineWidth : undefined,
      borderLeftColor: isLandscape ? theme.colors.outline : undefined,
    },
  });
};
