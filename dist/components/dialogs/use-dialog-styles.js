import { useWindowDimensions } from 'react-native';
const LARGE_SCREEN_WIDTH = 600;
const MAX_DIALOG_WIDTH = 500;
export const useDialogStyles = () => {
    const { width: deviceWidth } = useWindowDimensions();
    const width = deviceWidth > LARGE_SCREEN_WIDTH ? MAX_DIALOG_WIDTH : undefined;
    const alignSelf = width ? 'center' : undefined;
    return {
        width,
        alignSelf,
    };
};
//# sourceMappingURL=use-dialog-styles.js.map