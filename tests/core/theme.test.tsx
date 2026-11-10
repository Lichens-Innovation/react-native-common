import { renderHook } from '@testing-library/react-native';
import { PropsWithChildren } from 'react';
import { MD3LightTheme, PaperProvider } from 'react-native-paper';
import { DARK_THEME, LIGHT_THEME, NAVIGATION_DARK, NAVIGATION_LIGHT, useAppTheme, useIsDarkMode } from '@lib';

const withTheme =
  (theme: object) =>
  ({ children }: PropsWithChildren) => <PaperProvider theme={theme}>{children}</PaperProvider>;

describe('theme', () => {
  it.each`
    units        | expected
    ${undefined} | ${8}
    ${1}         | ${8}
    ${2}         | ${16}
    ${0.5}       | ${4}
  `('DARK_THEME / LIGHT_THEME spacing($units) = $expected', ({ units, expected }) => {
    expect(DARK_THEME.spacing(units)).toBe(expected);
    expect(LIGHT_THEME.spacing(units)).toBe(expected);
  });

  it('exposes dark and light flavours with navigation themes', () => {
    expect(DARK_THEME.dark).toBe(true);
    expect(LIGHT_THEME.dark).toBe(false);
    expect(NAVIGATION_DARK.dark).toBe(true);
    expect(NAVIGATION_LIGHT.dark).toBe(false);
    expect(NAVIGATION_DARK.fonts).toEqual(expect.objectContaining({ regular: expect.any(Object) }));
  });

  it('useAppTheme returns the provided app theme as is', async () => {
    // act
    const { result } = await renderHook(() => useAppTheme(), { wrapper: withTheme(DARK_THEME) });

    // assert
    expect(result.current.spacing).toBe(DARK_THEME.spacing);
    expect(result.current.colors.primary).toBe(DARK_THEME.colors.primary);
  });

  it('useAppTheme adds a spacing function when the provider theme has none', async () => {
    // act
    const { result } = await renderHook(() => useAppTheme(), { wrapper: withTheme(MD3LightTheme) });

    // assert
    expect(result.current.spacing()).toBe(8);
    expect(result.current.spacing(3)).toBe(24);
    expect(result.current.colors.primary).toBe(MD3LightTheme.colors.primary);
  });

  it.each`
    theme          | expected
    ${DARK_THEME}  | ${true}
    ${LIGHT_THEME} | ${false}
  `('useIsDarkMode → $expected', async ({ theme, expected }) => {
    // act
    const { result } = await renderHook(() => useIsDarkMode(), { wrapper: withTheme(theme) });

    // assert
    expect(result.current).toBe(expected);
  });
});
