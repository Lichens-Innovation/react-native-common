import { Platform } from 'react-native';
export const getMonospaceFontName = () => {
    return Platform.select({
        ios: 'Menlo',
        default: 'monospace',
    });
};
//# sourceMappingURL=font.utils.js.map