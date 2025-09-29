import { jsx as _jsx } from "react/jsx-runtime";
import { router } from 'expo-router';
import { HeaderButton } from './header-button';
export const HeaderBackButton = () => (_jsx(HeaderButton, { iconName: "arrow-left", onPress: () => router.back() }));
//# sourceMappingURL=header-back-button.js.map