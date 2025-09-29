type IconLibrary = 'AntDesign' | 'Entypo' | 'EvilIcons' | 'Feather' | 'FontAwesome' | 'FontAwesome5' | 'FontAwesome6' | 'Fontisto' | 'Foundation' | 'Ionicons' | 'MaterialCommunityIcons' | 'MaterialIcons' | 'Octicons' | 'SimpleLineIcons' | 'Zocial';
type IconProps = {
    library?: IconLibrary;
    name: string;
    color?: string;
    size?: number;
};
export declare const TabBarIcon: ({ name, color, size }: IconProps) => import("react").JSX.Element;
export declare const styles: {
    tabBarIcon: {
        marginBottom: number;
    };
};
export {};
