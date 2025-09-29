export const isProduction = (): boolean => {
  if (__DEV__) {
    return false;
  }

  return true;
};

export const isDevelopment = (): boolean => !isProduction();

export const getEnvVarsSource = (): string => {
  return 'desktop-executable';
};
