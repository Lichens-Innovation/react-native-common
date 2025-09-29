export const isProduction = () => {
    if (__DEV__) {
        return false;
    }
    return true;
};
export const isDevelopment = () => !isProduction();
export const getEnvVarsSource = () => {
    return 'desktop-executable';
};
//# sourceMappingURL=env.utils.windows.js.map