export declare const DARK_THEME: {
    colors: {
        primary: string;
        onPrimary: string;
        primaryContainer: string;
        onPrimaryContainer: string;
        secondary: string;
        onSecondary: string;
        secondaryContainer: string;
        onSecondaryContainer: string;
        tertiary: string;
        onTertiary: string;
        tertiaryContainer: string;
        onTertiaryContainer: string;
        error: string;
        onError: string;
        errorContainer: string;
        onErrorContainer: string;
        background: string;
        onBackground: string;
        surface: string;
        onSurface: string;
        surfaceVariant: string;
        onSurfaceVariant: string;
        outline: string;
        outlineVariant: string;
        shadow: string;
        scrim: string;
        inverseSurface: string;
        inverseOnSurface: string;
        inversePrimary: string;
        elevation: {
            level0: string;
            level1: string;
            level2: string;
            level3: string;
            level4: string;
            level5: string;
        };
        surfaceDisabled: string;
        onSurfaceDisabled: string;
        backdrop: string;
    };
    spacing: (units?: number) => number;
    roundness: number;
    dark: boolean;
    mode?: "adaptive" | "exact";
    animation: {
        scale: number;
        defaultAnimationDuration?: number;
    };
    version: 3;
    isV3: true;
    fonts: import("react-native-paper/lib/typescript/types").MD3Typescale;
};
export declare const LIGHT_THEME: {
    colors: {
        primary: string;
        onPrimary: string;
        primaryContainer: string;
        onPrimaryContainer: string;
        secondary: string;
        onSecondary: string;
        secondaryContainer: string;
        onSecondaryContainer: string;
        tertiary: string;
        onTertiary: string;
        tertiaryContainer: string;
        onTertiaryContainer: string;
        error: string;
        onError: string;
        errorContainer: string;
        onErrorContainer: string;
        background: string;
        onBackground: string;
        surface: string;
        onSurface: string;
        surfaceVariant: string;
        onSurfaceVariant: string;
        outline: string;
        outlineVariant: string;
        shadow: string;
        scrim: string;
        inverseSurface: string;
        inverseOnSurface: string;
        inversePrimary: string;
        elevation: {
            level0: string;
            level1: string;
            level2: string;
            level3: string;
            level4: string;
            level5: string;
        };
        surfaceDisabled: string;
        onSurfaceDisabled: string;
        backdrop: string;
    };
    spacing: (units?: number) => number;
    roundness: number;
    dark: boolean;
    mode?: "adaptive" | "exact";
    animation: {
        scale: number;
        defaultAnimationDuration?: number;
    };
    version: 3;
    isV3: true;
    fonts: import("react-native-paper/lib/typescript/types").MD3Typescale;
};
export type AppTheme = typeof DARK_THEME;
export declare const NAVIGATION_DARK: {
    fonts: {
        regular: {
            fontFamily: string;
            fontWeight: "normal" | "bold" | "100" | "200" | "300" | "400" | "500" | "600" | "700" | "800" | "900";
        };
        medium: {
            fontFamily: string;
            fontWeight: "normal" | "bold" | "100" | "200" | "300" | "400" | "500" | "600" | "700" | "800" | "900";
        };
        bold: {
            fontFamily: string;
            fontWeight: "normal" | "bold" | "100" | "200" | "300" | "400" | "500" | "600" | "700" | "800" | "900";
        };
        heavy: {
            fontFamily: string;
            fontWeight: "normal" | "bold" | "100" | "200" | "300" | "400" | "500" | "600" | "700" | "800" | "900";
        };
    };
    dark: boolean;
    colors: {
        primary: string;
        background: string;
        card: string;
        text: string;
        border: string;
        notification: string;
    };
};
export declare const NAVIGATION_LIGHT: {
    fonts: {
        regular: {
            fontFamily: string;
            fontWeight: "normal" | "bold" | "100" | "200" | "300" | "400" | "500" | "600" | "700" | "800" | "900";
        };
        medium: {
            fontFamily: string;
            fontWeight: "normal" | "bold" | "100" | "200" | "300" | "400" | "500" | "600" | "700" | "800" | "900";
        };
        bold: {
            fontFamily: string;
            fontWeight: "normal" | "bold" | "100" | "200" | "300" | "400" | "500" | "600" | "700" | "800" | "900";
        };
        heavy: {
            fontFamily: string;
            fontWeight: "normal" | "bold" | "100" | "200" | "300" | "400" | "500" | "600" | "700" | "800" | "900";
        };
    };
    dark: boolean;
    colors: {
        primary: string;
        background: string;
        card: string;
        text: string;
        border: string;
        notification: string;
    };
};
export declare const useAppTheme: () => AppTheme;
export declare const useIsDarkMode: () => boolean;
